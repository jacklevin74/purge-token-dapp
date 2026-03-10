const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Fetch full 86 bytes to inspect layout carefully
  // Also check if there's a ClaimRecord or different account type
  
  // First check all account sizes owned by the program
  const allAccounts = await conn.getProgramAccounts(PROGRAM_ID, {
    dataSlice: { offset: 0, length: 8 }, // just discriminator
  });
  
  const sizeCounts = {};
  for (const { account } of allAccounts) {
    sizeCounts[account.data.length] = (sizeCounts[account.data.length] || 0) + 1;
  }
  // Note: dataSlice truncates to 8 bytes, need space=true for real size
  console.log('Account data sizes (sliced to 8, showing discriminators):');
  
  // Re-fetch without slice to get real sizes
  const allAccounts2 = await conn.getProgramAccounts(PROGRAM_ID);
  const realSizes = {};
  for (const { account } of allAccounts2) {
    const sz = account.data.length;
    realSizes[sz] = (realSizes[sz] || 0) + 1;
  }
  console.log('Real account size distribution:');
  for (const [sz, cnt] of Object.entries(realSizes).sort((a,b) => Number(a[0])-Number(b[0]))) {
    console.log(`  ${sz} bytes: ${cnt} accounts`);
  }
  
  // Now check UserMint (86 bytes) — try all possible offsets for claimed byte
  const userMints = allAccounts2.filter(a => a.account.data.length === 86);
  console.log(`\nChecking ${userMints.length} UserMint accounts for claimed=1 at each possible offset...`);
  
  for (let offset = 80; offset < 86; offset++) {
    let ones = 0;
    for (const { account } of userMints) {
      if (account.data[offset] === 1) ones++;
    }
    console.log(`  Offset ${offset}: ${ones} accounts with value=1`);
  }
  
  // Also check first 5 accounts raw hex
  console.log('\nFirst 3 accounts raw hex (last 10 bytes):');
  for (const { pubkey, account } of userMints.slice(0, 3)) {
    const last10 = account.data.slice(76);
    console.log(`  ${pubkey.toBase58().slice(0,8)}...: ${Buffer.from(last10).toString('hex')}`);
  }
}
main().catch(console.error);
