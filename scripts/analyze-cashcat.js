const { createPublicClient, http, parseAbi, formatEther, formatUnits } = require('viem');

const CASHCAT = '0x020bfC650A365f8BB26819deAAbF3E21291018b4';
const WETH = '0x4200000000000000000000000000000000000006';
const POOL = '0x0bd7d308f8e1639fab988df18a8011f41eacad73';
const RPC = 'https://rpc.mainnet.chain.robinhood.com';
const CHAIN_ID = 4663;

const client = createPublicClient({
  chain: { id: CHAIN_ID, name: 'Robinhood Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC)
});

const transferEvent = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);
const swapEvent = parseAbi(['event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)']);

const JUN_18 = new Date('2026-06-18T00:00:00Z').getTime() / 1000;
const JUL_02 = new Date('2026-07-02T00:00:00Z').getTime() / 1000;
const JUL_23 = new Date('2026-07-23T23:59:59Z').getTime() / 1000;

async function findBlockByTimestamp(targetTs) {
  const latest = await client.getBlock({ blockTag: 'latest' });
  const latestNum = Number(latest.number);
  const latestTs = Number(latest.timestamp);

  if (targetTs >= latestTs) return latestNum;

  const block1 = await client.getBlock({ blockNumber: 1n });
  const block1Ts = Number(block1.timestamp);

  if (targetTs <= block1Ts) return 1;

  let lo = 1, hi = latestNum;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const block = await client.getBlock({ blockNumber: BigInt(mid) });
    if (Number(block.timestamp) < targetTs) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

async function getLogsInChunks(address, event, fromBlock, toBlock, chunkSize = 5000) {
  const logs = [];
  let from = fromBlock;
  while (from <= toBlock) {
    const to = Math.min(from + chunkSize - 1, toBlock);
    try {
      const chunk = await client.getLogs({
        address,
        event: event[0],
        fromBlock: BigInt(from),
        toBlock: BigInt(to)
      });
      logs.push(...chunk);
      process.stdout.write(`\r  Fetched blocks ${from}-${to} (${logs.length} events so far)`);
    } catch (err) {
      if (chunkSize > 500) {
        const smaller = Math.floor(chunkSize / 2);
        const sub = await getLogsInChunks(address, event, from, to, smaller);
        logs.push(...sub);
      } else {
        console.error(`\n  Error at blocks ${from}-${to}: ${err.message}`);
      }
    }
    from = to + 1;
  }
  console.log();
  return logs;
}

async function main() {
  console.log('=== CASHCAT On-Chain Analysis ===\n');
  console.log('Connecting to Robinhood Chain RPC...');

  const latestBlock = await client.getBlock({ blockTag: 'latest' });
  console.log(`Latest block: ${latestBlock.number} (${new Date(Number(latestBlock.timestamp) * 1000).toISOString()})\n`);

  console.log('Finding block ranges...');
  const blockJun18 = await findBlockByTimestamp(JUN_18);
  const blockJul02 = await findBlockByTimestamp(JUL_02);
  const blockJul23 = await findBlockByTimestamp(JUL_23);
  console.log(`  Jun 18 block: ~${blockJun18}`);
  console.log(`  Jul 02 block: ~${blockJul02}`);
  console.log(`  Jul 23 block: ~${blockJul23}\n`);

  // ---- PHASE 1: Get all CASHCAT transfers from pool (= buys) ----
  console.log('Fetching CASHCAT Transfer events from pool (buys)...');
  const transfersFromPool = await getLogsInChunks(
    CASHCAT, transferEvent, blockJun18, blockJul23
  );

  // Filter: transfers FROM the pool = someone bought CASHCAT
  const buys = transfersFromPool.filter(log =>
    log.args.from && log.args.from.toLowerCase() === POOL.toLowerCase()
  );

  // Filter: transfers TO the pool = someone sold CASHCAT
  const sells = transfersFromPool.filter(log =>
    log.args.to && log.args.to.toLowerCase() === POOL.toLowerCase()
  );

  console.log(`Total transfers: ${transfersFromPool.length}`);
  console.log(`Buys (from pool): ${buys.length}`);
  console.log(`Sells (to pool): ${sells.length}\n`);

  // ---- PHASE 2: Analyze wallets ----
  const wallets = {};

  for (const log of buys) {
    const wallet = log.args.to.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));
    const blockNum = Number(log.blockNumber);

    if (!wallets[wallet]) {
      wallets[wallet] = { address: log.args.to, buys: 0, sells: 0, totalBought: 0, totalSold: 0, firstBuyBlock: blockNum, lastBuyBlock: blockNum, buyBlocks: [] };
    }
    wallets[wallet].buys++;
    wallets[wallet].totalBought += amount;
    if (blockNum < wallets[wallet].firstBuyBlock) wallets[wallet].firstBuyBlock = blockNum;
    if (blockNum > wallets[wallet].lastBuyBlock) wallets[wallet].lastBuyBlock = blockNum;
    wallets[wallet].buyBlocks.push(blockNum);
  }

  for (const log of sells) {
    const wallet = log.args.from.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));

    if (!wallets[wallet]) {
      wallets[wallet] = { address: log.args.from, buys: 0, sells: 0, totalBought: 0, totalSold: 0, firstBuyBlock: Number(log.blockNumber), lastBuyBlock: Number(log.blockNumber), buyBlocks: [] };
    }
    wallets[wallet].sells++;
    wallets[wallet].totalSold += amount;
  }

  // Get timestamps for first buy blocks of top wallets
  const walletList = Object.values(wallets);
  walletList.sort((a, b) => b.totalBought - a.totalBought);

  // ---- PHASE 3: Separate pre-launch vs post-launch ----
  const preLaunchBuys = buys.filter(log => Number(log.blockNumber) <= blockJul02);
  const preLaunchWallets = {};

  for (const log of preLaunchBuys) {
    const wallet = log.args.to.toLowerCase();
    const amount = Number(formatUnits(log.args.value, 18));
    if (!preLaunchWallets[wallet]) {
      preLaunchWallets[wallet] = { address: log.args.to, buys: 0, totalBought: 0, firstBlock: Number(log.blockNumber) };
    }
    preLaunchWallets[wallet].buys++;
    preLaunchWallets[wallet].totalBought += amount;
    if (Number(log.blockNumber) < preLaunchWallets[wallet].firstBlock) {
      preLaunchWallets[wallet].firstBlock = Number(log.blockNumber);
    }
  }

  const preLaunchList = Object.values(preLaunchWallets);
  preLaunchList.sort((a, b) => b.totalBought - a.totalBought);

  // ---- OUTPUT ----
  console.log('==========================================');
  console.log('  PRE-LAUNCH BUYERS (Jun 18 - Jul 1)');
  console.log('==========================================\n');
  console.log(`Total unique wallets: ${preLaunchList.length}`);
  console.log(`Total buy transactions: ${preLaunchBuys.length}`);
  const preLaunchTotal = preLaunchList.reduce((s, w) => s + w.totalBought, 0);
  console.log(`Total CASHCAT bought: ${preLaunchTotal.toLocaleString()}\n`);

  console.log('Top pre-launch wallets:\n');
  console.log('Rank | Wallet                                     | Buys | CASHCAT Bought      | % of Pre-Launch');
  console.log('-----|-------------------------------------------|------|--------------------|-----------------');

  for (let i = 0; i < Math.min(preLaunchList.length, 100); i++) {
    const w = preLaunchList[i];
    const pct = ((w.totalBought / preLaunchTotal) * 100).toFixed(2);
    const short = w.address.slice(0, 6) + '...' + w.address.slice(-4);
    console.log(`${String(i + 1).padStart(4)} | ${w.address} | ${String(w.buys).padStart(4)} | ${w.totalBought.toLocaleString().padStart(18)} | ${pct}%`);
  }

  // Get timestamps for top 20 pre-launch wallets
  console.log('\n\nFirst buy timestamps for top pre-launch wallets:\n');
  for (let i = 0; i < Math.min(preLaunchList.length, 20); i++) {
    const w = preLaunchList[i];
    try {
      const block = await client.getBlock({ blockNumber: BigInt(w.firstBlock) });
      const date = new Date(Number(block.timestamp) * 1000);
      console.log(`  ${w.address.slice(0, 10)}... | First buy: ${date.toISOString()} | Block ${w.firstBlock}`);
    } catch (e) {
      console.log(`  ${w.address.slice(0, 10)}... | Block ${w.firstBlock} (timestamp fetch failed)`);
    }
  }

  console.log('\n\n==========================================');
  console.log('  ALL-TIME TOP 100 BUYERS (Jun 18 - Jul 23)');
  console.log('==========================================\n');
  console.log(`Total unique wallets: ${walletList.length}`);
  console.log(`Total buy transactions: ${buys.length}`);
  console.log(`Total sell transactions: ${sells.length}\n`);

  console.log('Rank | Wallet                                     | Buys | Sells | CASHCAT Bought      | CASHCAT Sold        | Net Holdings');
  console.log('-----|-------------------------------------------|------|-------|--------------------|--------------------|------------------');

  for (let i = 0; i < Math.min(walletList.length, 100); i++) {
    const w = walletList[i];
    const net = w.totalBought - w.totalSold;
    console.log(`${String(i + 1).padStart(4)} | ${w.address} | ${String(w.buys).padStart(4)} | ${String(w.sells).padStart(5)} | ${w.totalBought.toLocaleString().padStart(18)} | ${w.totalSold.toLocaleString().padStart(18)} | ${net.toLocaleString().padStart(18)}`);
  }

  // Daily volume analysis
  console.log('\n\n==========================================');
  console.log('  DAILY BUY VOLUME (Jun 18 - Jul 23)');
  console.log('==========================================\n');

  const dayBlocks = {};
  for (const log of buys) {
    const blockNum = Number(log.blockNumber);
    const amount = Number(formatUnits(log.args.value, 18));

    // We'll batch by block range and resolve timestamps for daily grouping
    if (!dayBlocks[blockNum]) dayBlocks[blockNum] = { amount: 0, count: 0 };
    dayBlocks[blockNum].amount += amount;
    dayBlocks[blockNum].count++;
  }

  // Sample blocks to build a block->date mapping
  const blockNums = Object.keys(dayBlocks).map(Number).sort((a, b) => a - b);
  const dailyVolume = {};

  // Sample every ~1000th block to build date mapping
  const sampleBlocks = [blockNums[0]];
  for (let i = 0; i < blockNums.length; i += Math.max(1, Math.floor(blockNums.length / 50))) {
    sampleBlocks.push(blockNums[i]);
  }
  sampleBlocks.push(blockNums[blockNums.length - 1]);

  const blockToDate = {};
  for (const bn of [...new Set(sampleBlocks)]) {
    try {
      const block = await client.getBlock({ blockNumber: BigInt(bn) });
      blockToDate[bn] = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0];
    } catch (e) {}
  }

  // Interpolate dates for all blocks
  const sortedSamples = Object.keys(blockToDate).map(Number).sort((a, b) => a - b);

  for (const bn of blockNums) {
    let date;
    // Find nearest sample
    let closest = sortedSamples[0];
    let minDist = Math.abs(bn - closest);
    for (const s of sortedSamples) {
      if (Math.abs(bn - s) < minDist) { closest = s; minDist = Math.abs(bn - s); }
    }
    date = blockToDate[closest];

    if (!dailyVolume[date]) dailyVolume[date] = { tokens: 0, txCount: 0, wallets: new Set() };
    dailyVolume[date].tokens += dayBlocks[bn].amount;
    dailyVolume[date].txCount += dayBlocks[bn].count;
  }

  console.log('Date       | Buy Txs | CASHCAT Volume');
  console.log('-----------|---------|-------------------');
  const sortedDates = Object.keys(dailyVolume).sort();
  for (const date of sortedDates) {
    const d = dailyVolume[date];
    console.log(`${date} | ${String(d.txCount).padStart(7)} | ${d.tokens.toLocaleString()}`);
  }

  console.log('\n\nDone! Data pulled directly from Robinhood Chain RPC.');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
