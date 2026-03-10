const { Connection, PublicKey } = require('@solana/web3.js');
const X1_RPC = 'https://rpc.mainnet.x1.xyz';

const TX_SIG = 'DUV11CQXMhnPRxm1isP3HLD8AsLHS4x1U615K5FgxRvoU1cEXhWrodDTSZjWhjyGYdQGXsRAt1ZkZMy8DdEjmLe';

async function main() {
  const conn = new Connection(X1_RPC, 'confirmed');
  
  const tx = await conn.getParsedTransaction(TX_SIG, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  });
  
  if (!tx) {
    console.log('Transaction not found');
    return;
  }
  
  console.log('=== TRANSACTION INFO ===');
  console.log(`Status: ${tx.meta?.err ? 'FAILED: ' + JSON.stringify(tx.meta.err) : 'SUCCESS'}`);
  console.log(`Slot: ${tx.slot}`);
  console.log(`Block time: ${tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : 'unknown'}`);
  
  console.log('\n=== ACCOUNTS INVOLVED ===');
  const accounts = tx.transaction.message.accountKeys;
  for (let i = 0; i < accounts.length; i++) {
    const a = accounts[i];
    const key = typeof a === 'string' ? a : a.pubkey?.toBase58() || JSON.stringify(a);
    const signer = (typeof a === 'object' && a.signer) ? ' [SIGNER]' : '';
    const writable = (typeof a === 'object' && a.writable) ? ' [WRITABLE]' : '';
    console.log(`  [${i}] ${key}${signer}${writable}`);
  }
  
  console.log('\n=== INSTRUCTIONS ===');
  const instructions = tx.transaction.message.instructions;
  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i];
    console.log(`  Instruction ${i}:`);
    if (ix.programId) console.log(`    Program: ${ix.programId.toBase58()}`);
    if (ix.program) console.log(`    Program (parsed): ${ix.program}`);
    if (ix.parsed) console.log(`    Parsed: ${JSON.stringify(ix.parsed, null, 2)}`);
    if (ix.data) console.log(`    Data (base58): ${ix.data}`);
    if (ix.accounts) console.log(`    Account indices: ${JSON.stringify(ix.accounts)}`);
  }
  
  console.log('\n=== INNER INSTRUCTIONS ===');
  if (tx.meta?.innerInstructions) {
    for (const inner of tx.meta.innerInstructions) {
      console.log(`  For ix ${inner.index}:`);
      for (const ix of inner.instructions) {
        if (ix.programId) console.log(`    Program: ${ix.programId.toBase58()}`);
        if (ix.program) console.log(`    Program: ${ix.program}`);
        if (ix.parsed) console.log(`    ${JSON.stringify(ix.parsed)}`);
        if (ix.data) console.log(`    Data: ${ix.data}`);
      }
    }
  }
  
  console.log('\n=== LOG MESSAGES ===');
  if (tx.meta?.logMessages) {
    for (const log of tx.meta.logMessages) {
      console.log(`  ${log}`);
    }
  }
  
  console.log('\n=== BALANCE CHANGES ===');
  if (tx.meta?.preBalances && tx.meta?.postBalances) {
    for (let i = 0; i < accounts.length; i++) {
      const diff = tx.meta.postBalances[i] - tx.meta.preBalances[i];
      if (diff !== 0) {
        const key = typeof accounts[i] === 'string' ? accounts[i] : accounts[i].pubkey?.toBase58();
        console.log(`  [${i}] ${key}: ${diff > 0 ? '+' : ''}${diff} lamports (${(diff/1e9).toFixed(6)} XNT)`);
      }
    }
  }
  
  console.log('\n=== TOKEN BALANCE CHANGES ===');
  if (tx.meta?.preTokenBalances && tx.meta?.postTokenBalances) {
    const pre = {};
    const post = {};
    for (const b of tx.meta.preTokenBalances) pre[b.accountIndex] = b;
    for (const b of tx.meta.postTokenBalances) post[b.accountIndex] = b;
    
    const allIndices = new Set([...Object.keys(pre), ...Object.keys(post)]);
    for (const idx of allIndices) {
      const preAmt = pre[idx]?.uiTokenAmount?.uiAmount || 0;
      const postAmt = post[idx]?.uiTokenAmount?.uiAmount || 0;
      const diff = postAmt - preAmt;
      if (diff !== 0) {
        const key = typeof accounts[Number(idx)] === 'string' ? accounts[Number(idx)] : accounts[Number(idx)].pubkey?.toBase58();
        const mint = pre[idx]?.mint || post[idx]?.mint;
        console.log(`  [${idx}] ${key}: ${diff > 0 ? '+' : ''}${diff} tokens (mint: ${mint})`);
      }
    }
  }
}
main().catch(console.error);
