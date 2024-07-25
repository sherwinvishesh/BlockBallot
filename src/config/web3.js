import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { AnchorProvider } from '@project-serum/anchor';
import idl from '../idl.json';

export const wallets = [
  new PhantomWalletAdapter(),
];

export const programId = new PublicKey(idl.metadata.address);

export const getProvider = async (wallet) => {
  const network = clusterApiUrl('devnet');
  const connection = new Connection(network, 'processed');

  const provider = new AnchorProvider(connection, wallet, 'processed');

  return provider;
}
