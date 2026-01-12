import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MNEE_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"; // Mainnet MNEE
  const INITIAL_MEMBERS = [deployer.address]; // Add more addresses

  const TreasuryBot = await ethers.getContractFactory("TreasuryBot");
  const treasuryBot = await TreasuryBot.deploy(MNEE_ADDRESS, INITIAL_MEMBERS);

  await treasuryBot.deployed();
  console.log("TreasuryBot deployed to:", treasuryBot.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});