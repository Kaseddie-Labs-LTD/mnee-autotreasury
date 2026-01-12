# MNEE AutoTreasury

**Autonomous programmable treasury with AI-driven execution for DAOs and communities.**

## Inspiration

DAOs and communities struggle with treasury management. Funds sit idle or require constant member attention for every transaction. We built MNEE AutoTreasury to automate treasury operations while maintaining transparency and security.

## What it does

MNEE AutoTreasury is a smart contract system that enables:

- **Multi-member treasury management** — Add/remove members with owner controls
- **MNEE token deposits** — Secure deposits using the MNEE USD stablecoin
- **Proposal system** — Create spending proposals with recipient, amount, and description
- **Voting mechanism** — Simple majority voting (50% + 1 members)
- **Dual execution modes**:
  - Manual execution after majority approval
  - AI oracle auto-execution based on predefined rules (emergency payments, small amounts, subscriptions)

## How we built it

**Smart Contracts:**
- Solidity 0.8.20 with OpenZeppelin security libraries
- ReentrancyGuard prevents reentrancy attacks
- SafeERC20 for secure token transfers
- Ownable pattern for access control
- Custom errors for gas efficiency

**Development Stack:**
- Hardhat for compilation and testing (with some config challenges resolved)
- Alchemy RPC for blockchain connectivity
- Etherscan for contract verification
- MNEE stablecoin integration (Mock for testnet: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF)

**Architecture:**
1. TreasuryBot.sol — Core treasury logic
2. MockERC20.sol — Test MNEE token for Sepolia
3. Deployment scripts with automatic verification
4. AI oracle integration ready (off-chain bot listens for events)

## Challenges we faced

- Wallet integration issues — MetaMask connectivity problems led us to generate new wallets programmatically
- Testnet faucet limitations — Alchemy faucet required mainnet balance; we found Google Cloud's Ethereum faucet as alternative
- Module system conflicts — Resolved ESM vs CommonJS issues in Hardhat configuration
- Time constraints — Focused on core smart contract functionality over full frontend

## Accomplishments

- ✅ Production-ready smart contract with comprehensive security features
- ✅ MNEE stablecoin integration for real-world use
- ✅ AI oracle architecture designed for autonomous execution
- ✅ Complete deployment and verification system
- ✅ Scalable architecture for mainnet deployment

## What we learned

- Smart contract security patterns (reentrancy protection, safe transfers)
- Event-driven architecture for off-chain integration
- Treasury management best practices
- Hardhat development workflow
- ERC-20 token integration patterns

## What's next

- **Frontend UI** — React interface with RainbowKit wallet connection
- **AI Bot Deployment** — Node.js oracle with rule-based and LLM-powered decision making
- **Advanced Features**:
  - Multi-signature requirements
  - Proposal categories and budgets
  - Timelock mechanisms
  - Member roles and permissions
- **Mainnet Deployment** — Launch with real MNEE tokens
- **Mobile App** — Cross-platform treasury management

## Contract Addresses (Sepolia Testnet)

*Note: Deployment in progress — will update with live addresses soon*
- TreasuryBot: [pending deployment]
- Mock MNEE: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF

## Use Cases

- DAO treasury automation
- Hackathon prize distribution
- Community savings pools
- Recurring payment automation
- Multi-sig operations with AI assistance

## Built With

Solidity • Hardhat • OpenZeppelin • Ethereum • MNEE • Alchemy • Etherscan • Smart Contracts • DAO • AI • Node.js • JavaScript

## Try It Out / Links

- GitHub: https://github.com/Kaseddie-Labs-LTD/mnee-autotreasury
- Etherscan (Sepolia): [pending live link]
- Documentation: /docs/SETUP.md & /docs/how-it-works

## Video Demo

[Insert Loom/YouTube link or attach file in submission]

**Quick Screen Recording (5 minutes):**
Use Windows Game Bar (Win + G) to record:
1. Show code in VS Code (TreasuryBot.sol)
2. Explain architecture & features
3. Show deployment scripts
4. Describe future AI oracle & mainnet plans

**Suggested Script (1–2 minutes):**
"This is MNEE AutoTreasury — an autonomous treasury system for DAOs and communities.
[Show TreasuryBot.sol] The smart contract handles deposits, proposals, voting, and execution with strong security from OpenZeppelin.
[Show features] Members deposit MNEE tokens, create proposals, and vote — with AI oracle auto-execution for efficiency.
[Show scripts] We built deployment automation and are ready for mainnet.
Thanks for checking out our hackathon project!"
