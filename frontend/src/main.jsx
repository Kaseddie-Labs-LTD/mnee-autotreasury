import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from 'wagmi/chains'; // For testnet; import { mainnet } from 'wagmi/chains' and add to chains array for production

const projectId = 'a8686175f46226d458257923bed844dd'; // Your Reown/WalletConnect Project ID

const config = getDefaultConfig({
  appName: 'MNEE AutoTreasury',
  projectId, // Enables WalletConnect
  chains: [sepolia], // Add mainnet for real MNEE: [sepolia, mainnet]
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);