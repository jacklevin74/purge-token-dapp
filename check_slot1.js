const { Connection, PublicKey } = require('@solana/web3.js');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // slot=1 account: B6BbQkyXiBYQDa3dFsiSRy2Ndi5L1bkPus6AKUvH1D1Y (claimed=249, reward=huge)
  // slot=5 account: 4RcNgyaAfdWT9BrzwYmMMmfjsC6nC4GtkN92mxK52JpT (reward=1766400, claimed=0)
  // These two should show us the actual layout
  
  const addrs = [
    'B6BbQkyXiBYQDa3dFsiSRy2Ndi5L1bkPus6AKUvH1D1Y', // slot=1, weird values
    '4RcNgyaAfdWT9BrzwYmMMmfjsC6nC4GtkN92mxK52JpT', // slot=5, was in the claim tx
  ];
  
  for (const addr of addrs) {
    const info = await conn.getAccountInfo(new PublicKey(addr));
    if (!info) { console.log(`${addr}: not found`); continue; }
    
    const hex = Buffer.from(info.data).toString('hex');
    console.log(`\n=== ${addr} ===`);
    console.log(`Length: ${info.data.length}`);
    console.log(`Full hex: ${hex}`);
    
    // Print byte-by-byte with offsets
    console.log('\nByte layout:');
    for (let i = 0; i < info.data.length; i++) {
      process.stdout.write(`[${i}]=${info.data[i].toString(16).padStart(2,'0')} `);
      if ((i+1) % 8 === 0) process.stdout.write('\n');
    }
    console.log('');
    
    // Try reading the actual layout from ClaimRewards.tsx:
    // disc(8) owner(32) slot(4) term(8) maturity(8) rank(8) amp(8) reward(8) claimed(1) bump(1)
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
    
    console.log(`Parsed:`);
    console.log(`  owner: ${owner}`);
    console.log(`  slot: ${slot}`);
    console.log(`  term: ${term}`);
    console.log(`  maturity: ${maturity} => ${new Date(Number(maturity)*1000).toISOString()}`);
    console.log(`  rank: ${rank}`);
    console.log(`  amp: ${amp}`);
    console.log(`  reward: ${reward}`);
    console.log(`  claimed: ${claimed} (0=no, 1=yes)`);
    console.log(`  bump: ${bump}`);
    console.log(`  offset used: ${off} (should be 85, total 86)`);
  }
}
main().catch(console.error);
