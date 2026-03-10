const { Connection, PublicKey } = require('@solana/web3.js');

const PROGRAM_ID = new PublicKey('6K6md8GFmT8fncNbWqHSJrduYfG6HgnFCp34jdouGVSM');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';
const USER = new PublicKey('DT2pSJE9yH72CkUNiCGCchyH3pB69CcCEaEmdihE6rG9');

function getUserCounterPDA(userPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_counter'), userPubkey.toBuffer()], PROGRAM_ID
  );
}

function getUserMintPDA(userPubkey, slotId) {
  const slotBuf = Buffer.alloc(4);
  slotBuf.writeUInt32LE(slotId, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_mint'), userPubkey.toBuffer(), slotBuf], PROGRAM_ID
  );
}

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');

  const [counterPDA] = getUserCounterPDA(USER);
  const counterInfo = await conn.getAccountInfo(counterPDA);
  if (!counterInfo) { console.log('No counter found for this wallet'); return; }

  let offset = 8;
  const nextSlot = counterInfo.data.readUInt32LE(offset); offset += 4;
  const activeCount = counterInfo.data.readUInt32LE(offset);
  console.log(`Counter: nextSlot=${nextSlot}, activeCount=${activeCount}`);

  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < nextSlot; i++) {
    const [mintPDA] = getUserMintPDA(USER, i);
    const info = await conn.getAccountInfo(mintPDA);
    if (!info) { console.log(`Slot ${i}: no account`); continue; }
    const d = info.data;
    let o = 8;
    const owner = new PublicKey(d.slice(o, o+32)).toBase58(); o+=32;
    const slotId = d.readUInt32LE(o); o+=4;
    const termDays = d.readBigUInt64LE(o); o+=8;
    const maturityTs = d.readBigInt64LE(o); o+=8;
    const cRank = d.readBigUInt64LE(o); o+=8;
    const amp = d.readBigUInt64LE(o); o+=8;
    const reward = d.readBigUInt64LE(o); o+=8;
    const claimed = d[o] === 1;
    const mature = Number(maturityTs) <= now;
    const matDate = new Date(Number(maturityTs)*1000).toISOString();
    console.log(`Slot ${slotId}: rank=${cRank} term=${termDays}d amp=${amp} reward=${reward} claimed=${claimed} mature=${mature} matures=${matDate}`);
  }
}
main().catch(console.error);
