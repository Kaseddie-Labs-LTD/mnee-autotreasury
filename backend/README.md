# MNEE AutoTreasury - Backend

Smart contract backend for autonomous programmable treasury with AI-driven execution.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Ethereum wallet with ETH for gas
- Sepolia testnet ETH ([get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# - Add PRIVATE_KEY (from MetaMask: Account Details > Show Private Key)
# - Add SEPOLIA_RPC_URL (or use default)
# - Add ETHERSCAN_API_KEY (get from etherscan.io)
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

Expected output: All tests should pass ✅

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

This will:
1. Deploy TreasuryBot contract
2. Add deployer as first member
3. Save deployment info to `deployment-info.json`
4. Show verification command

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF" "<YOUR_ADDRESS>"
```

## 📁 Project Structure

```
backend/
├── contracts/
│   ├── TreasuryBot.sol          # Main treasury contract
│   └── mocks/
│       └── MockERC20.sol         # Test MNEE token
├── scripts/
│   └── deployTreasuryBot.js     # Deployment script
├── test/
│   └── TreasuryBot.test.js      # Unit tests
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies
└── .env                         # Environment variables (DO NOT COMMIT)
```

## 🔧 Key Contract Features

### Member Management
- `addMember(address)` - Add treasury member (owner only)
- `removeMember(address)` - Remove member (owner only)
- `isMember(address)` - Check membership status

### Deposits
- `deposit(uint256 amount)` - Deposit MNEE tokens to treasury
- `getTreasuryBalance()` - View total MNEE in treasury

### Proposals
- `createProposal(recipient, amount, description)` - Create spending proposal
- `vote(proposalId, bool support)` - Vote yes/no on proposal
- `executeProposal(proposalId)` - Execute approved proposal (requires majority)
- `autoExecute(proposalId)` - AI oracle auto-execution

### AI Oracle
- `setAIOracle(address)` - Set AI bot address (owner only)
- AI can execute proposals without votes based on off-chain analysis

## 🧪 Testing Strategy

### Unit Tests Cover:
- ✅ Contract deployment
- ✅ Member add/remove
- ✅ MNEE deposits
- ✅ Proposal creation
- ✅ Voting mechanism
- ✅ Manual execution (with majority)
- ✅ AI auto-execution
- ✅ Access control
- ✅ Edge cases (double voting, insufficient balance, etc.)

Run with: `npm run test`

## 🔐 Security Features

1. **ReentrancyGuard** - Prevents reentrancy attacks on deposit/execute
2. **Access Control** - Ownable pattern for admin functions
3. **SafeERC20** - Safe token transfers via OpenZeppelin
4. **Custom Errors** - Gas-efficient error handling
5. **Vote Tracking** - Prevents double voting
6. **Execution Guards** - Can't execute twice, needs majority or AI oracle

## 🌐 Network Support

- **Sepolia Testnet** (recommended for testing)
- **Ethereum Mainnet** (production ready)
- MNEE Token: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`

## 📊 Deployment Info

After deployment, check `deployment-info.json` for:
- Contract address
- Network details
- Owner address
- Block number
- Timestamp

## 🔗 Integration with Frontend

Update frontend with:
```javascript
const CONTRACT_ADDRESS = "0x..."; // from deployment-info.json
const MNEE_TOKEN = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";
```

## 💡 Next Steps

1. ✅ Deploy to Sepolia
2. ✅ Verify on Etherscan
3. 🔄 Connect frontend
4. 🔄 Build AI bot (see ../ai-bot/)
5. 🔄 Test full flow: deposit → propose → vote → execute

## 🐛 Troubleshooting

### "Insufficient funds" error
- Get testnet ETH from [Sepolia faucet](https://sepoliafaucet.com/)

### "Invalid nonce" error
- Reset MetaMask account: Settings > Advanced > Clear activity tab data

### "Contract not verified"
- Run verify command (shown after deployment)
- Make sure constructor args match deployment

### Tests failing
- Run `npm install` to ensure all dependencies installed
- Check Node.js version (18+ required)

## 📚 Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [MNEE Documentation](https://docs.mnee.io)
- [Etherscan Sepolia](https://sepolia.etherscan.io)

## 📝 License

MIT License - see LICENSE file