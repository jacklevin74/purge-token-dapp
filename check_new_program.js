const { Connection, PublicKey } = require('@solana/web3.js');
const NEW_PROGRAM_ID = new PublicKey('6To4f6r9X3WFsLwWLFdj7ju8BNquzZwupVHUc8oS5pgP');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Get all accounts owned by this program
  const allAccounts = await conn.getProgramAccounts(NEW_PROGRAM_ID);
  
  // Size distribution
  const sizes = {};
  for (const { account } of allAccounts) {
    const sz = account.data.length;
    sizes[sz] = (sizes[sz] || 0) + 1;
  }
  
  console.log(`Total accounts owned by 6To4f6r9...: ${allAccounts.length}`);
  console.log('\nAccount size distribution:');
  for (const [sz, cnt] of Object.entries(sizes).sort((a,b) => Number(a[0])-Number(b[0]))) {
    console.log(`  ${sz} bytes: ${cnt} accounts`);
  }
  
  // Show raw hex for first 3 of each size
  const bySize = {};
  for (const { pubkey, account } of allAccounts) {
    const sz = account.data.length;
    if (!bySize[sz]) bySize[sz] = [];
    if (bySize[sz].length < 3) bySize[sz].push({ pubkey, data: account.data });
  }
  
  for (const [sz, entries] of Object.entries(bySize).sort((a,b) => Number(a[0])-Number(b[0]))) {
    console.log(`\n--- ${sz}-byte accounts (first 3) ---`);
    for (const { pubkey, data } of entries) {
      console.log(`  ${pubkey.toBase58()}`);
      console.log(`  hex: ${Buffer.from(data).toString('hex')}`);
    }
  }
  
  // If there are 86-byte accounts (UserMint), check claimed field
  if (sizes[86]) {
    const userMints = allAccounts.filter(a => a.account.data.length === 86);
    let claimed = 0, unclaimed = 0, withReward = 0;
    for (const { account } of userMints) {
      const d = account.data;
      const reward = d.readBigUInt64LE(76);
      const claimedByte = d[84];
      if (claimedByte === 1) claimed++;
      else unclaimed++;
      if (reward > 0n) withReward++;
    }
    console.log(`\nUserMint (86-byte) summary:`);
    console.log(`  Claimed: ${claimed}`);
    console.log(`  Unclaimed: ${unclaimed}`);
    console.log(`  With non-zero reward: ${withReward}`);
  }
}
main().catch(console.error);
