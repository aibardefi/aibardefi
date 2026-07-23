const { createPublicClient, http, parseAbi, formatUnits } = require('viem');

const CASHCAT = '0x020bfC650A365f8BB26819deAAbF3E21291018b4';
const RPC = 'https://rpc.mainnet.chain.robinhood.com';

const client = createPublicClient({
  chain: { id: 4663, name: 'Robinhood Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC, { retryCount: 5, retryDelay: 2000 })
});

const transferEvent = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);

const JUN_18 = new Date('2026-06-18T00:00:00Z').getTime() / 1000;
const JUL_09 = new Date('2026-07-09T00:00:00Z').getTime() / 1000; // end of Jul 8

async function findBlockByTimestamp(targetTs) {
  const latest = await client.getBlock({ blockTag: 'latest' });
  const latestNum = Number(latest.number);
  const block1 = await client.getBlock({ blockNumber: 1n });

  if (targetTs <= Number(block1.timestamp)) return 1;
  if (targetTs >= Number(latest.timestamp)) return latestNum;

  let lo = 1, hi = latestNum;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const block = await client.getBlock({ blockNumber: BigInt(mid) });
    if (Number(block.timestamp) < targetTs) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getLogsInChunks(address, event, fromBlock, toBlock, chunkSize = 10000) {
  const logs = [];
  let from = fromBlock;
  while (from <= toBlock) {
    const to = Math.min(from + chunkSize - 1, toBlock);
    let retries = 0;
    while (retries < 5) {
      try {
        const chunk = await client.getLogs({
          address,
          event: event[0],
          fromBlock: BigInt(from),
          toBlock: BigInt(to)
        });
        logs.push(...chunk);
        process.stdout.write(`\r  Blocks ${from}-${to} | ${logs.length} events`);
        break;
      } catch (err) {
        if (err.message.includes('Too Many') || err.message.includes('429')) {
          retries++;
          console.log(`\n  Rate limited, waiting ${retries * 3}s...`);
          await sleep(retries * 3000);
        } else if (chunkSize > 1000) {
          chunkSize = Math.floor(chunkSize / 2);
          break;
        } else {
          console.error(`\n  Error: ${err.message.slice(0, 100)}`);
          break;
        }
      }
    }
    from = to + 1;
  }
  console.log();
  return logs;
}

async function main() {
  console.log('=== CASHCAT Pre-Tweet Analysis (Jun 18 - Jul 8 end of day) ===\n');
  console.log('Connecting to Robinhood Chain...');

  const latestBlock = await client.getBlock({ blockTag: 'latest' });
  console.log(`Latest block: ${latestBlock.number}\n`);

  console.log('Finding block for Jun 18 00:00 UTC...');
  const blockStart = await findBlockByTimestamp(JUN_18);
  console.log(`  Jun 18 start = block ~${blockStart}`);

  console.log('Finding block for Jul 9 00:00 UTC (end of Jul 8)...');
  const blockEnd = await findBlockByTimestamp(JUL_09);
  console.log(`  Jul 9 start = block ~${blockEnd}`);
  console.log(`  Range: ${blockEnd - blockStart} blocks to scan\n`);

  console.log('Fetching ALL CASHCAT transfers (Jun 18 - Jul 8)...');
  const transfers = await getLogsInChunks(CASHCAT, transferEvent, blockStart, blockEnd);
  console.log(`Total transfer events: ${transfers.length}\n`);

  // Step 1: Auto-detect trading contract(s)
  console.log('--- DETECTING TRADING CONTRACTS ---\n');

  const fromCounts = {};
  const toCounts = {};

  for (const log of transfers) {
    const from = log.args.from ? log.args.from.toLowerCase() : 'unknown';
    const to = log.args.to ? log.args.to.toLowerCase() : 'unknown';
    fromCounts[from] = (fromCounts[from] || 0) + 1;
    toCounts[to] = (toCounts[to] || 0) + 1;
  }

  const topFrom = Object.entries(fromCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topTo = Object.entries(toCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  console.log('Top 10 "FROM" addresses (tokens sent from):');
  for (const [addr, count] of topFrom) {
    console.log(`  ${addr} => ${count} transfers`);
  }

  console.log('\nTop 10 "TO" addresses (tokens sent to):');
  for (const [addr, count] of topTo) {
    console.log(`  ${addr} => ${count} transfers`);
  }

  // The pool/trading contract is the address that appears frequently in BOTH from and to
  // (sends tokens to buyers, receives tokens from sellers)
  const allAddresses = new Set([...Object.keys(fromCounts), ...Object.keys(toCounts)]);
  const bothWays = [];
  for (const addr of allAddresses) {
    const f = fromCounts[addr] || 0;
    const t = toCounts[addr] || 0;
    if (f > 10 && t > 10) {
      bothWays.push({ address: addr, fromCount: f, toCount: t, total: f + t });
    }
  }
  bothWays.sort((a, b) => b.total - a.total);

  console.log('\nContracts with BOTH sends and receives (likely trading pools):');
  for (const entry of bothWays.slice(0, 10)) {
    console.log(`  ${entry.address} => sends: ${entry.fromCount}, receives: ${entry.toCount}, total: ${entry.total}`);
  }

  // Use the top contract as the pool
  const POOL = bothWays.length > 0 ? bothWays[0].address : null;

  if (!POOL) {
    // Fallback: use the single most common "from" address as pool
    const fallbackPool = topFrom[0] ? topFrom[0][0] : null;
    if (!fallbackPool) {
      console.log('\nERROR: Could not detect any trading contract. No pool-based analysis possible.');
      return;
    }
    console.log(`\nUsing fallback pool (top sender): ${fallbackPool}`);
  }

  console.log(`\n*** DETECTED POOL: ${POOL} ***\n`);

  // Step 2: Filter buys and sells using detected pool
  const buys = transfers.filter(log =>
    log.args.from && log.args.from.toLowerCase() === POOL
  );

  const sells = transfers.filter(log =>
    log.args.to && log.args.to.toLowerCase() === POOL
  );

  console.log(`Pool buys (tokens FROM pool TO wallet): ${buys.length}`);
  console.log(`Pool sells (tokens FROM wallet TO pool): ${sells.length}`);
  console.log(`Other transfers: ${transfers.length - buys.length - sells.length}\n`);

  // Step 3: Analyze wallets
  const wallets = {};

  for (const log of buys) {
    const addr = log.args.to.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));
    const bn = Number(log.blockNumber);

    if (!wallets[addr]) {
      wallets[addr] = { address: log.args.to, buys: 0, sells: 0, totalBought: 0, totalSold: 0, firstBlock: bn, blocks: [] };
    }
    wallets[addr].buys++;
    wallets[addr].totalBought += amount;
    if (bn < wallets[addr].firstBlock) wallets[addr].firstBlock = bn;
    wallets[addr].blocks.push(bn);
  }

  for (const log of sells) {
    const addr = log.args.from.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));

    if (!wallets[addr]) {
      wallets[addr] = { address: log.args.from, buys: 0, sells: 0, totalBought: 0, totalSold: 0, firstBlock: Number(log.blockNumber), blocks: [] };
    }
    wallets[addr].sells++;
    wallets[addr].totalSold += amount;
  }

  const walletList = Object.values(wallets);
  walletList.sort((a, b) => b.totalBought - a.totalBought);
  const totalBought = walletList.reduce((s, w) => s + w.totalBought, 0);

  // Get timestamps for top wallets
  console.log('Getting timestamps for top wallets...\n');
  for (let i = 0; i < Math.min(walletList.length, 50); i++) {
    try {
      const block = await client.getBlock({ blockNumber: BigInt(walletList[i].firstBlock) });
      walletList[i].firstDate = new Date(Number(block.timestamp) * 1000).toISOString();
    } catch (e) {
      walletList[i].firstDate = 'unknown';
    }
  }

  // Print results
  console.log('==========================================');
  console.log('  BUYERS BEFORE VLAD TWEET (Jun 18 - Jul 8)');
  console.log('==========================================\n');
  console.log(`Detected pool: ${POOL}`);
  console.log(`Unique wallets that bought: ${walletList.filter(w => w.buys > 0).length}`);
  console.log(`Unique wallets that sold: ${walletList.filter(w => w.sells > 0).length}`);
  console.log(`Total CASHCAT bought from pool: ${totalBought.toLocaleString()}`);
  console.log(`Total buy transactions: ${buys.length}`);
  console.log(`Total sell transactions: ${sells.length}\n`);

  console.log('--- TOP WALLETS (by CASHCAT bought) ---\n');

  for (let i = 0; i < Math.min(walletList.length, 100); i++) {
    const w = walletList[i];
    if (w.buys === 0) continue;
    const net = w.totalBought - w.totalSold;
    const pct = ((w.totalBought / totalBought) * 100).toFixed(2);
    const soldPct = w.totalBought > 0 ? ((w.totalSold / w.totalBought) * 100).toFixed(0) : '0';
    const date = w.firstDate ? w.firstDate.split('T')[0] : '?';
    const time = w.firstDate ? w.firstDate.split('T')[1].split('.')[0] : '?';

    console.log(`#${i + 1} | ${w.address}`);
    console.log(`   First buy: ${date} ${time} | Buys: ${w.buys} | Sells: ${w.sells}`);
    console.log(`   Bought: ${w.totalBought.toLocaleString()} CASHCAT (${pct}% of total)`);
    console.log(`   Sold: ${w.totalSold.toLocaleString()} (${soldPct}% of bought)`);
    console.log(`   Still holding: ${net.toLocaleString()} CASHCAT`);
    console.log('');
  }

  // Daily breakdown
  console.log('\n--- DAILY BREAKDOWN ---\n');

  const dailyData = {};
  const allBlocks = [...new Set(buys.map(b => Number(b.blockNumber)))].sort((a, b) => a - b);

  if (allBlocks.length > 0) {
    const step = Math.max(1, Math.floor(allBlocks.length / 30));
    const sampleSet = new Set();
    for (let i = 0; i < allBlocks.length; i += step) sampleSet.add(allBlocks[i]);
    sampleSet.add(allBlocks[0]);
    sampleSet.add(allBlocks[allBlocks.length - 1]);

    const blockDateMap = {};
    for (const bn of sampleSet) {
      try {
        const block = await client.getBlock({ blockNumber: BigInt(bn) });
        blockDateMap[bn] = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0];
      } catch (e) {}
    }

    const sortedSamples = Object.keys(blockDateMap).map(Number).sort((a, b) => a - b);

    function getDateForBlock(bn) {
      let closest = sortedSamples[0], minDist = Math.abs(bn - closest);
      for (const s of sortedSamples) {
        if (Math.abs(bn - s) < minDist) { closest = s; minDist = Math.abs(bn - s); }
      }
      return blockDateMap[closest];
    }

    for (const log of buys) {
      const bn = Number(log.blockNumber);
      const amount = Number(formatUnits(log.args.value, 18));
      const addr = log.args.to.toLowerCase();
      const date = getDateForBlock(bn);
      if (!dailyData[date]) dailyData[date] = { txs: 0, tokens: 0, wallets: new Set() };
      dailyData[date].txs++;
      dailyData[date].tokens += amount;
      dailyData[date].wallets.add(addr);
    }

    console.log('Date       | Buy Txs | Unique Wallets | CASHCAT Bought');
    console.log('-----------|---------|----------------|-------------------');
    for (const date of Object.keys(dailyData).sort()) {
      const d = dailyData[date];
      console.log(`${date} | ${String(d.txs).padStart(7)} | ${String(d.wallets.size).padStart(14)} | ${d.tokens.toLocaleString()}`);
    }
  } else {
    console.log('No buy data for daily breakdown.');
  }

  console.log('\n\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
