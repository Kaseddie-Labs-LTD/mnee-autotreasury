// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TreasuryBot
 * @notice Autonomous programmable treasury for shared MNEE budgets with AI-driven execution
 * @dev Supports deposits, proposals, voting, and automated execution via AI oracle
 */
contract TreasuryBot is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // MNEE token on mainnet: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
    IERC20 public immutable mneeToken;
    
    // AI oracle address - can auto-execute proposals
    address public aiOracle;
    
    // Member management
    mapping(address => bool) public isMember;
    address[] public members;
    uint256 public memberCount;
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        address recipient;
        uint256 amount;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        bool executed;
        uint256 createdAt;
    }
    
    // Storage
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Deposit tracking
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;
    
    // Events
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event Deposited(address indexed member, uint256 amount);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address recipient,
        uint256 amount,
        string description
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, address executor, bool isAI);
    event AIOrracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    // Errors
    error NotMember();
    error AlreadyMember();
    error InvalidAmount();
    error ProposalNotFound();
    error AlreadyVoted();
    error ProposalAlreadyExecuted();
    error InsufficientTreasuryBalance();
    error ProposalNotApproved();
    error UnauthorizedAIExecution();
    error InvalidRecipient();
    
    /**
     * @notice Constructor
     * @param _mneeToken Address of MNEE token
     * @param _initialOwner Initial owner/admin
     */
    constructor(address _mneeToken, address _initialOwner) Ownable(_initialOwner) {
        require(_mneeToken != address(0), "Invalid token address");
        mneeToken = IERC20(_mneeToken);
    }
    
    // ============ MEMBER MANAGEMENT ============
    
    /**
     * @notice Add a new member to the treasury
     * @param _member Address to add
     */
    function addMember(address _member) external onlyOwner {
        if (isMember[_member]) revert AlreadyMember();
        
        isMember[_member] = true;
        members.push(_member);
        memberCount++;
        
        emit MemberAdded(_member);
    }
    
    /**
     * @notice Remove a member from the treasury
     * @param _member Address to remove
     */
    function removeMember(address _member) external onlyOwner {
        if (!isMember[_member]) revert NotMember();
        
        isMember[_member] = false;
        memberCount--;
        
        emit MemberRemoved(_member);
    }
    
    /**
     * @notice Check if address is a member
     * @param _address Address to check
     */
    function checkMember(address _address) external view returns (bool) {
        return isMember[_address];
    }
    
    // ============ DEPOSITS ============
    
    /**
     * @notice Deposit MNEE tokens into treasury
     * @param _amount Amount of MNEE to deposit
     */
    function deposit(uint256 _amount) external nonReentrant {
        if (!isMember[msg.sender]) revert NotMember();
        if (_amount == 0) revert InvalidAmount();
        
        deposits[msg.sender] += _amount;
        totalDeposits += _amount;
        
        mneeToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        emit Deposited(msg.sender, _amount);
    }
    
    /**
     * @notice Get treasury balance
     */
    function getTreasuryBalance() external view returns (uint256) {
        return mneeToken.balanceOf(address(this));
    }
    
    // ============ PROPOSALS ============
    
    /**
     * @notice Create a spending proposal
     * @param _recipient Address to send MNEE to
     * @param _amount Amount of MNEE to send
     * @param _description Proposal description
     */
    function createProposal(
        address _recipient,
        uint256 _amount,
        string calldata _description
    ) external returns (uint256) {
        if (!isMember[msg.sender]) revert NotMember();
        if (_recipient == address(0)) revert InvalidRecipient();
        if (_amount == 0) revert InvalidAmount();
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.recipient = _recipient;
        proposal.amount = _amount;
        proposal.description = _description;
        proposal.createdAt = block.timestamp;
        
        emit ProposalCreated(proposalId, msg.sender, _recipient, _amount, _description);
        
        return proposalId;
    }
    
    /**
     * @notice Vote on a proposal
     * @param _proposalId Proposal ID
     * @param _support True for yes, false for no
     */
    function vote(uint256 _proposalId, bool _support) external {
        if (!isMember[msg.sender]) revert NotMember();
        if (_proposalId >= proposalCount) revert ProposalNotFound();
        
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.hasVoted[msg.sender]) revert AlreadyVoted();
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit Voted(_proposalId, msg.sender, _support);
    }
    
    /**
     * @notice Execute an approved proposal (manual)
     * @param _proposalId Proposal ID
     */
    function executeProposal(uint256 _proposalId) external nonReentrant {
        if (_proposalId >= proposalCount) revert ProposalNotFound();
        
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.executed) revert ProposalAlreadyExecuted();
        
        // Check if proposal has majority approval
        uint256 requiredVotes = (memberCount / 2) + 1;
        if (proposal.votesFor < requiredVotes) revert ProposalNotApproved();
        
        // Check treasury balance
        uint256 balance = mneeToken.balanceOf(address(this));
        if (balance < proposal.amount) revert InsufficientTreasuryBalance();
        
        proposal.executed = true;
        
        mneeToken.safeTransfer(proposal.recipient, proposal.amount);
        
        emit ProposalExecuted(_proposalId, msg.sender, false);
    }
    
    /**
     * @notice Auto-execute proposal via AI oracle
     * @param _proposalId Proposal ID
     */
    function autoExecute(uint256 _proposalId) external nonReentrant {
        if (msg.sender != aiOracle) revert UnauthorizedAIExecution();
        if (_proposalId >= proposalCount) revert ProposalNotFound();
        
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.executed) revert ProposalAlreadyExecuted();
        
        // AI can execute without votes (based on off-chain analysis)
        // Check treasury balance
        uint256 balance = mneeToken.balanceOf(address(this));
        if (balance < proposal.amount) revert InsufficientTreasuryBalance();
        
        proposal.executed = true;
        
        mneeToken.safeTransfer(proposal.recipient, proposal.amount);
        
        emit ProposalExecuted(_proposalId, msg.sender, true);
    }
    
    /**
     * @notice Set AI oracle address
     * @param _oracle New oracle address
     */
    function setAIOracle(address _oracle) external onlyOwner {
        address oldOracle = aiOracle;
        aiOracle = _oracle;
        emit AIOrracleUpdated(oldOracle, _oracle);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get proposal details
     * @param _proposalId Proposal ID
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        address recipient,
        uint256 amount,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed,
        uint256 createdAt
    ) {
        if (_proposalId >= proposalCount) revert ProposalNotFound();
        Proposal storage p = proposals[_proposalId];
        return (
            p.id,
            p.proposer,
            p.recipient,
            p.amount,
            p.description,
            p.votesFor,
            p.votesAgainst,
            p.executed,
            p.createdAt
        );
    }
    
    /**
     * @notice Check if member has voted on proposal
     * @param _proposalId Proposal ID
     * @param _member Member address
     */
    function hasVoted(uint256 _proposalId, address _member) external view returns (bool) {
        if (_proposalId >= proposalCount) revert ProposalNotFound();
        return proposals[_proposalId].hasVoted[_member];
    }
    
    /**
     * @notice Get all members
     */
    function getAllMembers() external view returns (address[] memory) {
        return members;
    }
}