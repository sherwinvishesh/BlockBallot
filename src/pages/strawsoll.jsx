import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program } from '@project-serum/anchor';
import { programId, getProvider } from '../config/web3';
import { Redirect, useParams } from 'react-router-dom';
import idl from '../idl.json';
import Spinner from '../components/spinner';
import { PublicKey } from '@solana/web3.js';
import { useEffect } from 'react';

function PollOption({ id, label, votes, total, voted, vote }) {
  return (
    <button
      onClick={() => !voted && vote(id)}
      className="bg-white items-center flex relative w-[500px] h-20 text-lg p-4 rounded-xl outline-none border-2 border-indigo-500"
      style={{ cursor: voted ? 'default' : 'pointer'}}
    >
      {
        voted && (
          <div 
            className="h-full absolute rounded-[9px] top-0 left-0 bg-indigo-300"
            style={{
                width: `${(votes / total * 500) - 4}px`
            }}
          />
        )
      }
      <span className="relative font-semibold max-w-[70%] truncate">{label}</span>
      {
        voted && (
          <span className="absolute top-[50%] right-5 -translate-y-1/2 text-slate-800 font-medium">
            {votes} votes <br />
            {votes / total * 100}%
          </span>
        )
      }
    </button>
  );
}

function Strawsoll() {
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const { strawsollId } = useParams();
  const wallet = useWallet();

  const subscribe = useCallback(async () => {
    const provider = await getProvider(wallet)
    const program = new Program(idl, programId, provider);

    const pollPubKey = new PublicKey(strawsollId)

    const emitter = program.account.poll.subscribe(pollPubKey);
    emitter.on('change', (data) => setPoll(data.options.filter(option => !!option)));

    const state = await program.account.poll.fetch(pollPubKey);

    setVoted(state.voters.find(voter => voter.toString() === provider.wallet.publicKey.toString()));
    setPoll(state.options.filter(option => !!option));
  }, [strawsollId, wallet]);

  useEffect(() => {
    if (strawsollId && wallet.connected) {
      subscribe();
    }
  }, [subscribe, strawsollId, wallet]);

  async function vote(id) {
    console.log(id)
    const provider = await getProvider(wallet);
    const program = new Program(idl, programId, provider);

    const pollPubKey = new PublicKey(strawsollId)
    
    try {
      await program.methods
        .vote(id)
        .accounts({
          poll: pollPubKey,
          voter: provider.wallet.publicKey,
        })
        .rpc();

      setVoted(true);
    } catch (error) {
      console.log(error.error.errorCode.code)
    }
  }

  if (!wallet.connected && !wallet.connecting) {
    return (
      <Redirect to="/" />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-5xl text-white font-bold text-center">Your time to vote!</h1>
        {
          voted && (
            <p className="text-lg text-center text-slate-100 font-bold">
              Only one vote allowed per wallet.
            </p>
          )
        }
      </div>
      {
        poll && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {
                poll.slice(0, 2).map(option => 
                  <PollOption key={option.id} {...option} total={poll.reduce((prev, curr) => prev + curr.votes, 0)} voted={voted} vote={vote} />)
              }
            </div>
            <div className="grid grid-cols-2 gap-4">
              {
                poll.slice(2, 4).map(option =>
                  <PollOption key={option.id} {...option} total={poll.reduce((prev, curr) => prev + curr.votes, 0)} voted={voted} vote={vote} />)
              }
            </div>
          </>
        )
      }
      {
        !poll && <Spinner />
      }
    </div>
  );
}

export default Strawsoll;
