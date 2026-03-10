const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Fetch all UserMint accounts, slice just the owner field (offset 8, 32 bytes)
  const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 86 }],
    dataSlice: { offset: 8, length: 32 },
  });
  
  console.log(`Total UserMint accounts: ${accounts.length}`);
  
  // Count unique owners
  const ownerCounts = {};
  for (const { account } of accounts) {
    const owner = new PublicKey(account.data).toBase58();
    ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
  }
  
  const sorted = Object.entries(ownerCounts).sort((a, b) => b[1] - a[1]);
  
  console.log(`\nUnique minters: ${sorted.length}`);
  console.log(`\nTop 20 minters by slot count:\n`);
  for (let i = 0; i < Math.min(20, sorted.length); i++) {
    const [wallet, count] = sorted[i];
    console.log(`#${i+1}  ${wallet}  (${count} slots)`);
  }
  
  // Distribution
  const dist = {};
  for (const [, count] of sorted) {
    dist[count] = (dist[count] || 0) + 1;
  }
  console.log('\nSlot count distribution:');
  for (const [slots, wallets] of Object.entries(dist).sort((a,b) => Number(a[0])-Number(b[0]))) {
    console.log(`  ${slots} slot(s): ${wallets} wallets`);
  }
}
main().catch(console.error);
