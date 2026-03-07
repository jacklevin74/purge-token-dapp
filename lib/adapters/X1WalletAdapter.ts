/**
 * Custom X1 Wallet Adapter
 * X1 Wallet is a Chrome extension that follows the Solana Wallet Standard.
 * It injects a `window.x1` (or `window.solana`-compatible) provider.
 */
import {
  BaseMessageSignerWalletAdapter,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction, Connection, SendOptions } from '@solana/web3.js';

interface X1Window {
  x1?: X1Provider;
  solana?: X1Provider;
}

interface X1Provider {
  isX1Wallet?: boolean;
  isConnected: boolean;
  publicKey?: { toBytes(): Uint8Array; toString(): string };
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string; toBytes(): Uint8Array } }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: string }>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
}

declare const window: X1Window & Window;

export const X1WalletName = 'X1 Wallet' as WalletName<'X1 Wallet'>;

export class X1WalletAdapter extends BaseMessageSignerWalletAdapter {
  name = X1WalletName;
  url = 'https://chromewebstore.google.com/detail/x1-wallet/kcfmcpdmlchhbikbogddmgopmjbflnae';
  icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMEZGQUEiLz4KPHRleHQgeD0iOCIgeT0iMjIiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZpbGw9IiMwMDAwMDAiIGZvbnQtd2VpZ2h0PSJib2xkIj5YMTwvdGV4dD4KPC9zdmc+Cg==';
  readonly supportedTransactionVersions = null;

  private _connecting: boolean;
  private _wallet: X1Provider | null;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.NotDetected;

  constructor() {
    super();
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;

    if (typeof window !== 'undefined') {
      this._checkIfReady();
    }
  }

  private _checkIfReady() {
    const provider = this._getProvider();
    if (provider) {
      this._readyState = WalletReadyState.Installed;
      this.emit('readyStateChange', this._readyState);
    } else {
      // Poll briefly for wallet injection
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const p = this._getProvider();
        if (p) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          clearInterval(interval);
        } else if (attempts > 20) {
          clearInterval(interval);
        }
      }, 100);
    }
  }

  private _getProvider(): X1Provider | null {
    if (typeof window === 'undefined') return null;
    // X1 Wallet injects as window.x1 or as a Phantom-compatible provider
    const provider = window.x1 || (window.solana?.isX1Wallet ? window.solana : null);
    return provider ?? null;
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

      this._connecting = true;

      const wallet = this._getProvider();
      if (!wallet) throw new WalletNotReadyError();

      let account: { toString(): string; toBytes(): Uint8Array };
      try {
        const resp = await wallet.connect();
        account = resp.publicKey;
      } catch (error: unknown) {
        throw new WalletConnectionError((error as Error)?.message, error as Error);
      }

      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(account.toString());
      } catch (error: unknown) {
        throw new WalletPublicKeyError((error as Error)?.message, error as Error);
      }

      wallet.on('disconnect', this._disconnected);
      wallet.on('accountChanged', this._accountChanged);

      this._wallet = wallet;
      this._publicKey = publicKey;

      this.emit('connect', publicKey);
    } catch (error: unknown) {
      this.emit('error', error as WalletError);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      wallet.off('disconnect', this._disconnected);
      wallet.off('accountChanged', this._accountChanged);

      this._wallet = null;
      this._publicKey = null;

      try {
        await wallet.disconnect();
      } catch (error: unknown) {
        this.emit('error', new WalletDisconnectionError((error as Error)?.message, error as Error));
      }
    }
    this.emit('disconnect');
  }

  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendOptions & { signers?: never[] }
  ): Promise<string> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const { signature } = await wallet.signAndSendTransaction(transaction, options);
        return signature;
      } catch (error: unknown) {
        throw new WalletSendTransactionError((error as Error)?.message, error as Error);
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError);
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return await wallet.signTransaction(transaction);
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error as Error);
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return await wallet.signAllTransactions(transactions);
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error as Error);
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const { signature } = await wallet.signMessage(message);
        return signature;
      } catch (error: unknown) {
        throw new WalletSignMessageError((error as Error)?.message, error as Error);
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError);
      throw error;
    }
  }

  private _disconnected = () => {
    const wallet = this._wallet;
    if (wallet) {
      wallet.off('disconnect', this._disconnected);
      wallet.off('accountChanged', this._accountChanged);

      this._wallet = null;
      this._publicKey = null;

      this.emit('error', new WalletDisconnectedError());
      this.emit('disconnect');
    }
  };

  private _accountChanged = (...args: unknown[]) => {
    const newPublicKey = args[0] as PublicKey | undefined;
    if (!newPublicKey) return;
    const publicKey = this._publicKey;
    if (!publicKey) return;

    try {
      const pk = new PublicKey(newPublicKey.toString());
      if (pk.equals(publicKey)) return;
      this._publicKey = pk;
      this.emit('connect', pk);
    } catch {
      this.emit('error', new WalletPublicKeyError('Invalid public key from accountChanged'));
    }
  };
}
