const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Layout: disc(8) owner(32) slot(4) term(8) maturity(8) rank(8) amp(8) reward(8) claimed(1) bump(1) = 86
  // rank offset = 8+32+4+8+8 = 60
  // claimed offset = 84
  // Fetch only the bytes we need: rank(8) + claimed(1) starting at offset 60
  const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 86 }],
    dataSlice: { offset: 60, length: 25 }, // rank(8) + amp(8) + reward(8) + claimed(1)
  });
  
  console.log(`Total UserMint accounts: ${accounts.length}`);
  
  let claimed = 0, unclaimed = 0;
  const rankCounts = {};
  
  for (const { account } of accounts) {
    const d = account.data;
    // After slicing from offset 60: rank at [0], claimed at [24]
    const claimedByte = d[24];
    const rank = d.readBigUInt64LE(0);
    
    if (claimedByte === 1) claimed++;
    else unclaimed++;
    
    const rankStr = rank.toString();
    rankCounts[rankStr] = (rankCounts[rankStr] || 0) + 1;
  }
  
  console.log(`Claimed: ${claimed}`);
  console.log(`Unclaimed: ${unclaimed}`);
  console.log(`\nRank distribution (top 20):`);
  
  const sorted = Object.entries(rankCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
  for (const [rank, count] of sorted.slice(0, 20)) {
    console.log(`  Rank ${rank}: ${count} mints`);
  }
  
  if (sorted.length > 20) {
    console.log(`  ... and ${sorted.length - 20} more rank values`);
  }
  
  console.log(`\nTotal unique rank values: ${sorted.length}`);
  
  // Also show highest ranks
  const byRankNum = Object.entries(rankCounts).sort((a, b) => Number(BigInt(b[0]) - BigInt(a[0])));
  console.log(`\nHighest ranks:`);
  for (const [rank, count] of byRankNum.slice(0, 10)) {
    console.log(`  Rank ${rank}: ${count} mints`);
  }
}
main().catch(console.error);
