const { Connection, PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  // Get all UserMint accounts with reward > 0 (claimed)
  // Layout: disc(8) owner(32) slot(4) term(8) maturity(8) rank(8) amp(8) reward(8) claimed(1) bump(1)
  const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 86 }],
  });
  
  const claimed = [];
  for (const { pubkey, account } of accounts) {
    const d = account.data;
    const reward = d.readBigUInt64LE(76);
    if (reward === 0n) continue;
    
    const owner = new PublicKey(d.slice(8, 40)).toBase58();
    const slot = d.readUInt32LE(40);
    const term = d.readBigUInt64LE(44);
    const maturity = d.readBigInt64LE(52);
    const rank = d.readBigUInt64LE(60);
    const amp = d.readBigUInt64LE(68);
    
    // reward is raw with 2 decimals
    const rewardDisplay = Number(reward) / 100;
    
    claimed.push({ pubkey: pubkey.toBase58(), owner, slot, term: Number(term), rank: Number(rank), amp: Number(amp), reward: rewardDisplay });
  }
  
  // Sort by reward descending
  claimed.sort((a, b) => b.reward - a.reward);
  
  console.log(`\nTop ${Math.min(claimed.length, 10)} PURGE Claimers (by reward):\n`);
  for (let i = 0; i < Math.min(claimed.length, 10); i++) {
    const c = claimed[i];
    console.log(`#${i+1}`);
    console.log(`  Wallet: ${c.owner}`);
    console.log(`  Slot: ${c.slot} | Rank: ${c.rank} | Term: ${c.term} days | AMP: ${c.amp}`);
    console.log(`  PURGE Claimed: ${c.reward.toLocaleString()}`);
    console.log('');
  }
  
  // Also show total PURGE claimed
  const totalPurge = claimed.reduce((sum, c) => sum + c.reward, 0);
  console.log(`Total PURGE claimed across all ${claimed.length} claims: ${totalPurge.toLocaleString()}`);
  
  // Aggregate by wallet (some wallets may have claimed multiple slots)
  const byWallet = {};
  for (const c of claimed) {
    if (!byWallet[c.owner]) byWallet[c.owner] = { total: 0, slots: 0 };
    byWallet[c.owner].total += c.reward;
    byWallet[c.owner].slots++;
  }
  
  const walletList = Object.entries(byWallet).sort((a,b) => b[1].total - a[1].total);
  if (walletList.length < claimed.length) {
    console.log('\nBy unique wallet:');
    for (const [wallet, data] of walletList) {
      console.log(`  ${wallet}: ${data.total.toLocaleString()} PURGE (${data.slots} slot${data.slots>1?'s':''})`);
    }
  }
}
main().catch(console.error);
