const { createPublicClient, http, parseAbi, formatUnits } = require('viem');

const SLIPPY = '0xF0568863195770965a6D8abb0aa87F4314b80320';
const RPC = 'https://rpc.mainnet.chain.robinhood.com';

const client = createPublicClient({
  chain: { id: 4663, name: 'Robinhood Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC, { retryCount: 5, retryDelay: 2000 })
});

const transferEvent = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
          await sleep(retries * 3000);
        } else if (chunkSize > 1000) {
          chunkSize = Math.floor(chunkSize / 2);
          break;
        } else {
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
  // SLIPPY created Jul 16 2026 ~17:05 UTC
  const CREATED = new Date('2026-07-16T17:00:00Z').getTime() / 1000;
  const TWO_DAYS = new Date('2026-07-18T17:00:00Z').getTime() / 1000;

  console.log('=== SLIPPY First 2 Days Analysis (Jul 16-18) ===\n');
  console.log('Connecting to Robinhood Chain...');

  const latestBlock = await client.getBlock({ blockTag: 'latest' });
  console.log(`Latest block: ${latestBlock.number}\n`);

  console.log('Finding block for Jul 16 17:00 UTC...');
  const blockStart = await findBlockByTimestamp(CREATED);
  console.log(`  Start = block ~${blockStart}`);

  console.log('Finding block for Jul 18 17:00 UTC...');
  const blockEnd = await findBlockByTimestamp(TWO_DAYS);
  console.log(`  End = block ~${blockEnd}`);
  console.log(`  Range: ${blockEnd - blockStart} blocks\n`);

  console.log('Fetching SLIPPY transfers...');
  const transfers = await getLogsInChunks(SLIPPY, transferEvent, blockStart, blockEnd);
  console.log(`Total transfer events: ${transfers.length}\n`);

  // Auto-detect pool
  console.log('--- DETECTING POOL ---\n');
  const fromCounts = {};
  const toCounts = {};
  for (const log of transfers) {
    const f = log.args.from.toLowerCase();
    const t = log.args.to.toLowerCase();
    fromCounts[f] = (fromCounts[f] || 0) + 1;
    toCounts[t] = (toCounts[t] || 0) + 1;
  }

  const allAddrs = new Set([...Object.keys(fromCounts), ...Object.keys(toCounts)]);
  let bestPool = null, bestTotal = 0;
  for (const addr of allAddrs) {
    const sends = fromCounts[addr] || 0;
    const receives = toCounts[addr] || 0;
    if (sends > 10 && receives > 10) {
      const total = sends + receives;
      if (total > bestTotal) {
        bestTotal = total;
        bestPool = addr;
      }
    }
  }

  if (!bestPool) {
    console.log('Could not detect pool. Listing top FROM/TO addresses:\n');
    const topFrom = Object.entries(fromCounts).sort((a,b) => b[1]-a[1]).slice(0,5);
    const topTo = Object.entries(toCounts).sort((a,b) => b[1]-a[1]).slice(0,5);
    console.log('Top FROM:', topFrom);
    console.log('Top TO:', topTo);
    return;
  }

  console.log(`Detected pool: ${bestPool}`);
  console.log(`  Sends: ${fromCounts[bestPool]}, Receives: ${toCounts[bestPool]}\n`);

  const buys = transfers.filter(log =>
    log.args.from && log.args.from.toLowerCase() === bestPool
  );
  const sells = transfers.filter(log =>
    log.args.to && log.args.to.toLowerCase() === bestPool
  );

  console.log(`Pool buys (tokens out): ${buys.length}`);
  console.log(`Pool sells (tokens in): ${sells.length}\n`);

  // Analyze wallets
  const wallets = {};

  for (const log of buys) {
    const addr = log.args.to.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));
    const bn = Number(log.blockNumber);

    if (!wallets[addr]) {
      wallets[addr] = { address: log.args.to, buys: 0, sells: 0, totalBought: 0, totalSold: 0, firstBlock: bn, lastBlock: bn, txHashes: [] };
    }
    wallets[addr].buys++;
    wallets[addr].totalBought += amount;
    if (bn < wallets[addr].firstBlock) wallets[addr].firstBlock = bn;
    if (bn > wallets[addr].lastBlock) wallets[addr].lastBlock = bn;
    wallets[addr].txHashes.push(log.transactionHash);
  }

  for (const log of sells) {
    const addr = log.args.from.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));

    if (!wallets[addr]) {
      wallets[addr] = { address: log.args.from, buys: 0, sells: 0, totalBought: 0, totalSold: 0, firstBlock: Number(log.blockNumber), lastBlock: Number(log.blockNumber), txHashes: [] };
    }
    wallets[addr].sells++;
    wallets[addr].totalSold += amount;
  }

  const walletList = Object.values(wallets);
  walletList.sort((a, b) => b.totalBought - a.totalBought);
  const totalBought = walletList.reduce((s, w) => s + w.totalBought, 0);

  // Get timestamps for all wallets (first 2 days is small enough)
  console.log('Getting timestamps...\n');
  const blockTimestampCache = {};
  for (let i = 0; i < walletList.length; i++) {
    const bn = walletList[i].firstBlock;
    if (!blockTimestampCache[bn]) {
      try {
        const block = await client.getBlock({ blockNumber: BigInt(bn) });
        blockTimestampCache[bn] = Number(block.timestamp);
      } catch (e) {
        blockTimestampCache[bn] = null;
      }
    }
    const ts = blockTimestampCache[bn];
    walletList[i].firstDate = ts ? new Date(ts * 1000).toISOString() : 'unknown';
  }

  // Print results
  console.log('==========================================');
  console.log('  SLIPPY BUYERS - FIRST 2 DAYS');
  console.log('  Jul 16 17:00 - Jul 18 17:00 UTC');
  console.log('==========================================\n');
  console.log(`Detected pool: ${bestPool}`);
  console.log(`Unique wallets that bought: ${walletList.filter(w => w.buys > 0).length}`);
  console.log(`Unique wallets that sold: ${walletList.filter(w => w.sells > 0).length}`);
  console.log(`Total SLIPPY bought from pool: ${totalBought.toLocaleString()}`);
  console.log(`Total buy transactions: ${buys.length}`);
  console.log(`Total sell transactions: ${sells.length}\n`);

  console.log('--- ALL BUYERS (by SLIPPY bought) ---\n');
  console.log(`${'#'.padStart(4)} | ${'Wallet'.padEnd(44)} | ${'First Buy'.padEnd(19)} | ${'Buys'.padStart(5)} | ${'Sells'.padStart(5)} | ${'SLIPPY Bought'.padStart(18)} | ${'% Total'.padStart(7)} | ${'% Sold'.padStart(6)} | ${'Still Holds'.padStart(18)}`);
  console.log('-'.repeat(160));

  for (let i = 0; i < walletList.length; i++) {
    const w = walletList[i];
    if (w.buys === 0) continue;
    const net = w.totalBought - w.totalSold;
    const pct = ((w.totalBought / totalBought) * 100).toFixed(2);
    const soldPct = w.totalBought > 0 ? ((w.totalSold / w.totalBought) * 100).toFixed(0) : '0';
    const date = w.firstDate !== 'unknown' ? w.firstDate.replace('T', ' ').replace('.000Z', '') : '?';

    console.log(`${String(i + 1).padStart(4)} | ${w.address.padEnd(44)} | ${date.padEnd(19)} | ${String(w.buys).padStart(5)} | ${String(w.sells).padStart(5)} | ${w.totalBought.toLocaleString().padStart(18)} | ${(pct + '%').padStart(7)} | ${(soldPct + '%').padStart(6)} | ${net.toLocaleString().padStart(18)}`);
  }

  // Hourly breakdown
  console.log('\n\n--- HOURLY BREAKDOWN ---\n');
  const hourlyData = {};

  for (const log of buys) {
    const bn = Number(log.blockNumber);
    const amount = Number(formatUnits(log.args.value, 18));
    const addr = log.args.to.toLowerCase();

    let ts = blockTimestampCache[bn];
    if (!ts) {
      // Find nearest cached timestamp
      const cached = Object.keys(blockTimestampCache).map(Number).sort((a,b) => a-b);
      let closest = cached[0];
      for (const c of cached) {
        if (Math.abs(bn - c) < Math.abs(bn - closest)) closest = c;
      }
      ts = blockTimestampCache[closest];
    }

    if (ts) {
      const d = new Date(ts * 1000);
      const hourKey = d.toISOString().slice(0, 13) + ':00';
      if (!hourlyData[hourKey]) hourlyData[hourKey] = { txs: 0, tokens: 0, wallets: new Set() };
      hourlyData[hourKey].txs++;
      hourlyData[hourKey].tokens += amount;
      hourlyData[hourKey].wallets.add(addr);
    }
  }

  console.log('Hour (UTC)        | Buy Txs | Wallets | SLIPPY Bought');
  console.log('------------------|---------|---------|-------------------');
  for (const hour of Object.keys(hourlyData).sort()) {
    const d = hourlyData[hour];
    console.log(`${hour} | ${String(d.txs).padStart(7)} | ${String(d.wallets.size).padStart(7)} | ${d.tokens.toLocaleString()}`);
  }

  console.log('\n\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
