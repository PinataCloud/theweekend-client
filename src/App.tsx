import { useState, useEffect, useCallback } from 'react'
import sdk from '@farcaster/frame-sdk';
import { Context } from '@farcaster/frame-sdk';
import { BaseError, useAccount, useConnect, useDisconnect, useWaitForTransactionReceipt, useWriteContract, useReadContract } from 'wagmi';
import { config } from './utils/config';
import { abi, CONTRACT_ADDRESS } from './utils/contract-mainnet';
import { Button } from './components/ui/button';
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ImagePreloader } from './components/image-preloader';

function App() {
  // Combine related state to reduce render cycles
  const [sdkState, setSdkState] = useState({
    isLoaded: false,
    context: undefined as Context.FrameContext | undefined
  });
  const [isWeekend, setIsWeekend] = useState(false);
  const [minted, setMinted] = useState(false)

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const timestamp = Math.floor(Date.now() / 1000);

  const { data: weekendStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'isWeekEnd',
    args: [timestamp],
  });

  // Memoize submit function to prevent recreation on each render
  const submit = useCallback(() => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'mint',
    });
  }, [writeContract]);

  // Load SDK only once
  useEffect(() => {
    if (!sdkState.isLoaded) {
      const loadSdk = async () => {
        try {
          const context = await sdk.context;
          setSdkState({ isLoaded: true, context });
          sdk.actions.ready();
        } catch (error) {
          console.error("SDK loading error:", error);
          setSdkState(prev => ({ ...prev, isLoaded: true }));
        }
      };

      loadSdk();
    }
  }, [sdkState.isLoaded]);

  // Update isWeekend state only when weekendStatus changes
  useEffect(() => {
    if (weekendStatus !== undefined && !!weekendStatus !== isWeekend) {
      setIsWeekend(!!weekendStatus);
    }
  }, [weekendStatus, isWeekend]);

  // Handle error toasts
  useEffect(() => {
    if (error) {
      const errorMessage = (error as BaseError).shortMessage || error.message;
      toast(errorMessage);
    }
  }, [error]);

  // Handle success toasts
  useEffect(() => {
    if (isConfirmed) {
      setMinted(true)
      toast("Mint Success!");
    }
  }, [isConfirmed]);

  if (!sdkState.isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-4 mx-4'>
      <ImagePreloader />
      {!address && (
        <>
          <h2 className='text-3xl font-bold'>Is it the Weekend?</h2>
          <p>Mint an NFT, but only on the weekend</p>
          <img src="https://dweb.mypinata.cloud/ipfs/QmTidtsgh4faygkV3Fj1f2gfdLNYCFh3gsgNVWRsGwSQbA" alt="isittheweekend" />
        </>
      )}
      {address && isWeekend && !minted && (
        <>
          <h2 className='text-3xl font-bold'>Status: The Weekend</h2>
          <p>You can now mint The Weekend for free!</p>
          <img src="https://dweb.mypinata.cloud/ipfs/QmeDejkafV9hwBE2zYmmfUkLb5AjqPFpRUY2XkbLd8iq6n" alt="theweekend" />
          <Button onClick={submit} disabled={isPending} type="submit">
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : 'Mint'}
          </Button>
        </>
      )}
      {address && isWeekend && minted && (
        <>
          <h2 className='text-3xl font-bold'>Mint Successful!</h2>
          <p>Congrats!! Enjoy the weekend 🫡</p>
          <img src="https://dweb.mypinata.cloud/ipfs/QmZpFMrCFc8Xs3orLBUukiG3f1VfNaHweSZYTB2SyZGyfc" alt="theweekend" />
          <Button onClick={async () => await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=I%20just%20minted%20The%20Weekend%2C%20only%20available%20on%20the%20weekends.%20Get%20yours%20now!&embeds[]=https://theweekend.lol`)}>Share</Button>
        </>
      )}
      {address && !isWeekend && (
        <>
          <h2 className='text-3xl font-bold'>Status: Not The Weekend</h2>
          <img src="https://dweb.mypinata.cloud/ipfs/QmQgqbUnCVwcXvdXjPMxEvY2vTv9HLY3ZwjG6rQS9Jc8XN" alt="theweekend" />
          <p>Come back after 12am UTC on Saturday</p>
        </>
      )}
      <Button
        onClick={() =>
          isConnected
            ? disconnect()
            : connect({ connector: config.connectors[0] })
        }
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </Button>
      <div className='mt-18 text-center'>
        <Button className='cursor-pointer' variant="link" onClick={async () => await sdk.actions.openUrl(`https://pinata.cloud`)}>

          <img className='h-16' src="/pinata.png" alt="pinatalogo" />
        </Button>
      </div>
    </div>
  )
}

export default App
