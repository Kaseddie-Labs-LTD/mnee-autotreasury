import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function App() {
  const { address, isConnected } = useAccount();

  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>MNEE Autonomous Treasury Bot</h1>
      <ConnectButton />
      {isConnected && <p>Connected Address: {address}</p>}
    </div>
  );
}

export default App;