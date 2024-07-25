import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, web3 } from '@project-serum/anchor';
import { programId, getProvider } from '../config/web3';
import { Redirect, useHistory } from 'react-router-dom';
import idl from '../idl.json';
import Spinner from '../components/spinner';

const { Keypair } = web3;

function CreatePoll() {
  const [pollKey, setPollKey] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const wallet = useWallet();
  const history = useHistory();

  async function initialize(options) {
    const provider = await getProvider(wallet);
    const program = new Program(idl, programId, provider);

    const newPollKeypair = Keypair.generate();
    setPollKey(newPollKeypair.publicKey.toString());

    try {
      await program.methods
        .initialize(options.filter(option => !!option))
        .accounts({
          owner: provider.wallet.publicKey,
          poll: newPollKeypair.publicKey,
        })
        .signers([newPollKeypair])
        .rpc();

      setLoading(false);
      setCreated(true);
    } catch (error) {
      setLoading(false);
    }
  }

  const handleChange = (e, idx) => {
    setShowError(false);
    setOptions(old => {
      old[idx] = e.target.value;

      return [...old];
    })
  }

  if (!wallet.connected && !wallet.connecting) {
    return (
      <Redirect to="/" />
    );
  }

  if (created) {
    return (
      <div className="flex flex-col gap-10 justify-center items-center w-full h-full">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl text-white font-bold text-center">
            🎉 Your poll was created! 🎉
          </h1>
          <p className="text-lg text-white font-semibold">
            Click in the code bellow to copy it, then send it to whoever you want!
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <button
            className="bg-white px-4 py-2 rounded-lg text-indigo-500 font-semibold text-lg"
            onClick={() => {
              navigator.clipboard.writeText(`${pollKey}`);
              setCopied(true);
            }}
          >
            {pollKey}
          </button>
          {
            copied && 
            <span className="text-green-700 font-bold">Copied to clipboard!</span>
          }
          <button
            className="bg-indigo-500 px-4 py-2 rounded-lg text-white font-semibold text-lg"
            onClick={() => {
              history.push(`/soll/${pollKey}`)
            }}
          >
            Join Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-5xl text-white font-bold text-center">Time to create your poll!</h1>
        <p className="text-lg text-center text-slate-100 font-bold">
          Input 2-4 options to start your poll!
        </p>
      </div>
      <div className="flex gap-4">
        <input type="text" className="bg-white w-[400px] text-lg p-4 rounded-xl outline-none border-2 border-indigo-500"
          placeholder='First poll option'
          value={options[0]}
          onChange={e => handleChange(e, 0)}
        />
        <input type="text" className="bg-white w-[400px] text-lg p-4 rounded-xl outline-none border-2 border-indigo-500"
          placeholder='Second poll option'
          value={options[1]}
          onChange={e => handleChange(e, 1)}
        />
      </div>
      <div className="flex gap-4">
        <input type="text" className="bg-white w-[400px] text-lg p-4 rounded-xl outline-none border-2 border-indigo-500"
          placeholder='Third poll option'
          value={options[2]}
          onChange={e => handleChange(e, 2)}
        />
        <input type="text" className="bg-white w-[400px] text-lg p-4 rounded-xl outline-none border-2 border-indigo-500"
          placeholder='Fourth poll option'
          value={options[3]}
          onChange={e => handleChange(e, 3)}
        />
      </div>
      {
        !showError ? (
          <div className="h-6" />
        ) : (
          <span className="text-red-600 h-6 w-[800px] font-semibold text-lg">
            São necessárias pelo menos 2 opção não vazias.
          </span>

        )
      }
      <button
        className="bg-indigo-500 mt-10 text-white rounded-xl text-xl font-bold py-4 w-[400px]"
        onClick={() => {
          if (loading) return;
          if (options.filter(opt => opt.trim()).length < 2) {
            setShowError(true);
            return;
          }

          setLoading(true);
          initialize(options.map(option => option.trim()));
        }}
      >
        {
          loading ? <Spinner /> : 'Create'
        }
      </button>
    </div>
  );
}

export default CreatePoll;
