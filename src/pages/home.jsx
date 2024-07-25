import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
require('@solana/wallet-adapter-react-ui/styles.css');

function Home() {
  const [pollKey, setPollKey] = useState('');
  const wallet = useWallet();

  if (!wallet.connected && !wallet.connecting) {
    return (
      <div className="flex flex-col items-center gap-20 justify-center h-full w-full">
        <h1 className="text-4xl text-white font-bold">
          Connect your wallet to create poll and vote!
        </h1>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-10 w-full h-full">
      <div className="flex flex-col gap-4 w-[400px]">
        <input type="text" className="bg-white text-lg p-4 rounded-xl outline-none border-2 border-indigo-500"
          placeholder='Poll Code'
          value={pollKey}
          onChange={e => setPollKey(e.target.value.replace(/ /g, ''))}
        />
        <Link to={`/soll/${pollKey}`}>
          <button disabled={!pollKey} className="bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl p-4 w-full font-semibold text-xl">
            Join Poll
          </button>
        </Link>
      </div>
      <div className="w-[1px] h-[40%] bg-white" />
      <Link to="/create">
        <button className="bg-indigo-500 text-white rounded-xl p-4 w-[400px] font-semibold text-xl">
          Create Poll
        </button>
      </Link>
    </div>
  );
}

export default Home;
