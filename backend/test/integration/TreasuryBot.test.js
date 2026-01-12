// Save this as: backend/test/TreasuryBot.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TreasuryBot", function () {
  let treasuryBot;
  let mockMNEE;
  let owner;
  let member1;
  let member2;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, member1, member2] = await ethers.getSigners();

    // Deploy mock MNEE token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockMNEE = await MockERC20.deploy("MNEE", "MNEE", INITIAL_SUPPLY);
    await mockMNEE.waitForDeployment();

    // Deploy TreasuryBot
    const TreasuryBot = await ethers.getContractFactory("TreasuryBot");
    treasuryBot = await TreasuryBot.deploy(await mockMNEE.getAddress(), owner.address);
    await treasuryBot.waitForDeployment();

    // Give tokens to test accounts
    await mockMNEE.transfer(member1.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await treasuryBot.owner()).to.equal(owner.address);
    });

    it("Should set the correct MNEE token", async function () {
      expect(await treasuryBot.mneeToken()).to.equal(await mockMNEE.getAddress());
    });
  });

  describe("Member Management", function () {
    it("Should add members", async function () {
      await treasuryBot.addMember(member1.address);
      expect(await treasuryBot.isMember(member1.address)).to.be.true;
    });

    it("Should remove members", async function () {
      await treasuryBot.addMember(member1.address);
      await treasuryBot.removeMember(member1.address);
      expect(await treasuryBot.isMember(member1.address)).to.be.false;
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      await treasuryBot.addMember(member1.address);
    });

    it("Should allow deposits", async function () {
      const amount = ethers.parseEther("100");
      await mockMNEE.connect(member1).approve(await treasuryBot.getAddress(), amount);
      await treasuryBot.connect(member1).deposit(amount);
      expect(await treasuryBot.getTreasuryBalance()).to.equal(amount);
    });
  });
});