// Check if anyone has successfully claimed — if so, their mint slots will show claimed=true
// Also check if there are any mints where reward != 0 (pre-set)
const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  // Get all accounts owned by the program
  const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 86 }], // UserMint size
    dataSlice: { offset: 76, length: 10 } // claimed byte + surrounding
  });
  
  let claimed = 0, unclaimed = 0;
  for (const { account } of accounts) {
    if (account.data[0] === 1) claimed++;
    else unclaimed++;
  }
  console.log(`Total UserMint accounts: ${accounts.length}`);
  console.log(`Claimed: ${claimed}`);
  console.log(`Unclaimed: ${unclaimed}`);

  // Also check a few with non-zero reward field
  const accounts2 = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 86 }],
  });
  
  let nonZeroReward = 0;
  for (const { account } of accounts2) {
    const d = account.data;
    const reward = d.readBigUInt64LE(68); // offset 8+32+4+8+8+8+8 = 68... wait
    // layout: disc(8) owner(32) slot(4) term(8) maturity(8) rank(8) amp(8) reward(8) claimed(1) bump(1)
    // reward offset = 8+32+4+8+8+8+8 = 76? No: 8+32+4 = 44, +8 = 52, +8 = 60, +8 = 68, +8 = 76
    const rewardVal = d.readBigUInt64LE(68);
    if (rewardVal > 0n) nonZeroReward++;
  }
  console.log(`Mints with pre-set reward > 0: ${nonZeroReward}`);
}
main().catch(console.error);
