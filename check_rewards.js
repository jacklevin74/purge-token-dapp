const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Fetch UserMint accounts with reward + claimed fields
  // Layout: disc(8) owner(32) slot(4) term(8) maturity(8) rank(8) amp(8) reward(8) claimed(1) bump(1)
  // reward offset = 8+32+4+8+8+8+8 = 76
  // claimed offset = 84
  // Slice from 76: reward(8) + claimed(1) + bump(1) = 10 bytes
  const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 86 }],
    dataSlice: { offset: 76, length: 10 },
  });
  
  console.log(`Total UserMint accounts: ${accounts.length}`);
  
  let withReward = 0;
  let claimed = 0;
  let claimedWithReward = 0;
  let claimedNoReward = 0;
  
  // Check every byte position for non-zero claimed-like values
  const byteDistrib = Array(10).fill(0).map(() => ({}));
  
  for (const { account } of accounts) {
    const d = account.data;
    const reward = d.readBigUInt64LE(0); // offset 76 in full account
    const claimedByte = d[8]; // offset 84 in full account
    const bumpByte = d[9];    // offset 85 in full account
    
    if (reward > 0n) withReward++;
    if (claimedByte === 1) {
      claimed++;
      if (reward > 0n) claimedWithReward++;
      else claimedNoReward++;
    }
    
    // Track unique values at each byte position
    for (let i = 0; i < 10; i++) {
      const v = d[i];
      byteDistrib[i][v] = (byteDistrib[i][v] || 0) + 1;
    }
  }
  
  console.log(`\nWith non-zero reward: ${withReward}`);
  console.log(`Claimed (byte[84]=1): ${claimed}`);
  console.log(`  - claimed with reward: ${claimedWithReward}`);
  console.log(`  - claimed without reward: ${claimedNoReward}`);
  
  console.log('\nByte distribution at each position (offset from 76):');
  for (let i = 0; i < 10; i++) {
    const entries = Object.entries(byteDistrib[i]).sort((a,b) => Number(b[1])-Number(a[1]));
    const top = entries.slice(0, 5).map(([v, c]) => `${v}:${c}`).join(' ');
    console.log(`  [${i}] (abs offset ${76+i}): ${top}`);
  }
}
main().catch(console.error);
