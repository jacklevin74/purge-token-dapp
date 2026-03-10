const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

// From the tx: signer=DT2pSJE9yH72CkUNiCGCchyH3pB69CcCEaEmdihE6rG9, slot=5 claimed
// Account [1] = 4RcNgyaAfdWT9BrzwYmMMmfjsC6nC4GtkN92mxK52JpT (writable, likely the UserMint PDA)
// Account [2] = 5fUS5HtyMberLZivChhsWSoWqZVZVDB4pGQmkxoupXSD (writable)

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Check both candidate accounts from the tx
  const candidates = [
    '4RcNgyaAfdWT9BrzwYmMMmfjsC6nC4GtkN92mxK52JpT',
    '5fUS5HtyMberLZivChhsWSoWqZVZVDB4pGQmkxoupXSD',
    '9tRDMiWGvLR862E37a2XftKBa86cgWWrwNbdsp3osj2v',
  ];
  
  for (const addr of candidates) {
    const info = await conn.getAccountInfo(new PublicKey(addr));
    if (!info) { console.log(`${addr}: not found`); continue; }
    
    console.log(`\n=== ${addr} ===`);
    console.log(`Owner: ${info.owner.toBase58()}`);
    console.log(`Data length: ${info.data.length}`);
    console.log(`Raw hex: ${Buffer.from(info.data).toString('hex')}`);
    
    if (info.data.length === 86) {
      // UserMint layout: disc(8) owner(32) slot(4) term(8) maturity(8) rank(8) amp(8) reward(8) claimed(1) bump(1)
      const d = info.data;
      let off = 8;
      const owner = new PublicKey(d.slice(off, off+32)).toBase58(); off += 32;
      const slot = d.readUInt32LE(off); off += 4;
      const term = d.readBigUInt64LE(off); off += 8;
      const maturity = d.readBigInt64LE(off); off += 8;
      const rank = d.readBigUInt64LE(off); off += 8;
      const amp = d.readBigUInt64LE(off); off += 8;
      const reward = d.readBigUInt64LE(off); off += 8;
      const claimed = d[off]; off += 1;
      const bump = d[off];
      
      console.log(`  owner: ${owner}`);
      console.log(`  slot: ${slot}`);
      console.log(`  term: ${term}`);
      console.log(`  maturity: ${maturity} (${new Date(Number(maturity)*1000).toISOString()})`);
      console.log(`  rank: ${rank}`);
      console.log(`  amp: ${amp}`);
      console.log(`  reward: ${reward}`);
      console.log(`  claimed: ${claimed} (${claimed === 1 ? 'YES ✅' : 'NO'})`);
      console.log(`  bump: ${bump}`);
    }
  }
  
  // Now find ALL UserMint accounts for this wallet
  const wallet = new PublicKey('DT2pSJE9yH72CkUNiCGCchyH3pB69CcCEaEmdihE6rG9');
  console.log(`\n=== UserMint accounts for ${wallet.toBase58()} ===`);
  const userMints = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { dataSize: 86 },
      { memcmp: { offset: 8, bytes: wallet.toBase58() } }
    ]
  });
  console.log(`Found: ${userMints.length}`);
  for (const { pubkey, account } of userMints) {
    const d = account.data;
    let off = 8+32;
    const slot = d.readUInt32LE(off); off += 4;
    off += 8+8+8+8+8; // term, maturity, rank, amp, reward
    const reward = d.readBigUInt64LE(off-8);
    const claimed = d[84];
    console.log(`  PDA: ${pubkey.toBase58()} | slot=${slot} | reward=${reward} | claimed=${claimed}`);
  }
}
main().catch(console.error);
