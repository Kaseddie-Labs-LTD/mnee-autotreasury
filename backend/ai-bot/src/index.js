const { ethers } = require('ethers');
require('dotenv').config();

// Load contract ABI (you'll need to copy this from artifacts after compilation)
const TREASURY_ABI = [
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address recipient, uint256 amount, string description)",
  "function getProposal(uint256 proposalId) external view returns (uint256 id, address proposer, address recipient, uint256 amount, string description, uint256 votesFor, uint256 votesAgainst, bool executed, uint256 createdAt)",
  "function autoExecute(uint256 proposalId) external",
  "function getTreasuryBalance() external view returns (uint256)",
  "function aiOracle() external view returns (address)"
];

class AIOracle {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.AI_ORACLE_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      TREASURY_ABI,
      this.wallet
    );
    
    console.log('🤖 AI Oracle Bot initialized');
    console.log('📍 Contract:', process.env.CONTRACT_ADDRESS);
    console.log('🔑 Oracle Address:', this.wallet.address);
  }

  async start() {
    console.log('\n🚀 Starting AI Oracle Bot...\n');
    
    // Verify we are the AI oracle
    const currentOracle = await this.contract.aiOracle();
    if (currentOracle.toLowerCase() !== this.wallet.address.toLowerCase()) {
      console.error('❌ ERROR: This address is not set as AI Oracle in contract');
      console.error(`   Contract oracle: ${currentOracle}`);
      console.error(`   Bot address: ${this.wallet.address}`);
      console.error('\n   Run: contract.setAIOracle("' + this.wallet.address + '")');
      process.exit(1);
    }
    
    console.log('✅ Verified as AI Oracle\n');
    
    // Listen for new proposals
    this.contract.on('ProposalCreated', async (proposalId, proposer, recipient, amount, description) => {
      console.log('\n📝 New Proposal Detected!');
      console.log('─'.repeat(50));
      console.log(`   Proposal ID: ${proposalId}`);
      console.log(`   Proposer: ${proposer}`);
      console.log(`   Recipient: ${recipient}`);
      console.log(`   Amount: ${ethers.formatEther(amount)} MNEE`);
      console.log(`   Description: ${description}`);
      console.log('─'.repeat(50));
      
      await this.analyzeAndExecute(proposalId, amount, description);
    });
    
    console.log('👂 Listening for proposals...');
    console.log('   Press Ctrl+C to stop\n');
  }

  async analyzeAndExecute(proposalId, amount, description) {
    try {
      console.log('\n🔍 Analyzing proposal...');
      
      // Get proposal details
      const proposal = await this.contract.getProposal(proposalId);
      
      // Check if already executed
      if (proposal.executed) {
        console.log('⚠️  Proposal already executed, skipping');
        return;
      }
      
      // AI LOGIC - Customize these rules!
      const shouldExecute = await this.aiDecision(proposal, description);
      
      if (shouldExecute) {
        console.log('✅ AI Decision: EXECUTE');
        await this.executeProposal(proposalId);
      } else {
        console.log('❌ AI Decision: SKIP (manual voting required)');
      }
      
    } catch (error) {
      console.error('❌ Error analyzing proposal:', error.message);
    }
  }

  async aiDecision(proposal, description) {
    // SIMPLE RULE-BASED AI (you can replace with LLM API later)
    
    const amountInMNEE = Number(ethers.formatEther(proposal.amount));
    const descriptionLower = description.toLowerCase();
    
    console.log('\n🧠 AI Analysis:');
    
    // Rule 1: Auto-approve emergency payments under 10 MNEE
    if (descriptionLower.includes('emergency') && amountInMNEE < 10) {
      console.log('   ✓ Emergency payment < 10 MNEE');
      return true;
    }
    
    // Rule 2: Auto-approve recurring payments (e.g., subscriptions)
    if (descriptionLower.includes('subscription') && amountInMNEE < 50) {
      console.log('   ✓ Subscription payment < 50 MNEE');
      return true;
    }
    
    // Rule 3: Auto-approve gas refunds under 5 MNEE
    if (descriptionLower.includes('gas') && amountInMNEE < 5) {
      console.log('   ✓ Gas refund < 5 MNEE');
      return true;
    }
    
    // Rule 4: Check treasury balance (don't execute if would leave < 100 MNEE)
    const treasuryBalance = await this.contract.getTreasuryBalance();
    const balanceAfter = Number(ethers.formatEther(treasuryBalance)) - amountInMNEE;
    
    if (balanceAfter < 100) {
      console.log('   ✗ Would leave treasury with < 100 MNEE');
      return false;
    }
    
    // Rule 5: Time-sensitive payments (can add time checks)
    if (descriptionLower.includes('urgent') && amountInMNEE < 20) {
      console.log('   ✓ Urgent payment < 20 MNEE');
      return true;
    }
    
    // Default: require manual voting for large or non-urgent payments
    console.log('   ✗ Requires manual voting (large or non-urgent)');
    return false;
  }

  async executeProposal(proposalId) {
    try {
      console.log('\n⚙️  Executing proposal...');
      
      const tx = await this.contract.autoExecute(proposalId);
      console.log('   Transaction hash:', tx.hash);
      console.log('   Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('✅ Proposal executed successfully!');
      console.log('   Block:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());
      
    } catch (error) {
      console.error('❌ Execution failed:', error.message);
      
      if (error.message.includes('InsufficientTreasuryBalance')) {
        console.error('   Reason: Not enough MNEE in treasury');
      } else if (error.message.includes('ProposalAlreadyExecuted')) {
        console.error('   Reason: Proposal was already executed');
      }
    }
  }

  // Future: Integrate with LLM API
  async llmAnalysis(description) {
    // Example: Call Claude or GPT-4 API
    // const response = await fetch('https://api.anthropic.com/v1/messages', {
    //   method: 'POST',
    //   headers: {
    //     'x-api-key': process.env.ANTHROPIC_API_KEY,
    //     'content-type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'claude-3-sonnet-20240229',
    //     messages: [{
    //       role: 'user',
    //       content: `Should this treasury proposal be auto-approved? Description: "${description}"`
    //     }]
    //   })
    // });
    // return response.shouldApprove;
    
    console.log('   (LLM integration coming soon)');
    return false;
  }
}

// Start the bot
async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   MNEE AutoTreasury - AI Oracle Bot      ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  if (!process.env.CONTRACT_ADDRESS) {
    console.error('❌ ERROR: CONTRACT_ADDRESS not set in .env');
    process.exit(1);
  }
  
  if (!process.env.AI_ORACLE_PRIVATE_KEY) {
    console.error('❌ ERROR: AI_ORACLE_PRIVATE_KEY not set in .env');
    process.exit(1);
  }
  
  const bot = new AIOracle();
  await bot.start();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});