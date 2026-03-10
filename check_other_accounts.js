const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  const allAccounts = await conn.getProgramAccounts(PROGRAM_ID);
  
  const size17 = allAccounts.filter(a => a.account.data.length === 17);
  const size41 = allAccounts.filter(a => a.account.data.length === 41);
  
  console.log(`17-byte accounts: ${size17.length}`);
  console.log(`41-byte accounts: ${size41.length}`);
  
  console.log('\n17-byte accounts (raw hex):');
  for (const { pubkey, account } of size17.slice(0, 10)) {
    console.log(`  ${pubkey.toBase58()}: ${Buffer.from(account.data).toString('hex')}`);
  }
  
  console.log('\n41-byte accounts (raw hex):');
  for (const { pubkey, account } of size41) {
    console.log(`  ${pubkey.toBase58()}: ${Buffer.from(account.data).toString('hex')}`);
  }
  
  // 17 bytes = 8 disc + 8 u64 + 1 bool? or 8 disc + 32 pubkey? No, 32+8=40 not 17
  // 17 = 8 disc + 8 u64 + 1 bool (claimed flag + counter?)
  // 41 = 8 disc + 32 pubkey + 1 bool? 
  
  // Try to read 17-byte as: disc(8) + value(8) + flag(1)
  console.log('\n17-byte decoded (disc+u64+bool):');
  for (const { pubkey, account } of size17.slice(0, 10)) {
    const d = account.data;
    const disc = Buffer.from(d.slice(0,8)).toString('hex');
    const val = d.readBigUInt64LE(8);
    const flag = d[16];
    console.log(`  ${pubkey.toBase58().slice(0,12)}: disc=${disc} val=${val} flag=${flag}`);
  }
  
  // 41-byte: disc(8) + pubkey(32) + bool(1)
  console.log('\n41-byte decoded (disc+pubkey+bool):');
  for (const { pubkey, account } of size41) {
    const d = account.data;
    const disc = Buffer.from(d.slice(0,8)).toString('hex');
    const owner = new PublicKey(d.slice(8, 40)).toBase58();
    const flag = d[40];
    console.log(`  ${pubkey.toBase58().slice(0,12)}: owner=${owner.slice(0,12)} flag=${flag}`);
  }
}
main().catch(console.error);
