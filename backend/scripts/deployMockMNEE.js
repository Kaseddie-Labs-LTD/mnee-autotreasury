const hre = require("hardhat");

async function main() {
  console.log("🪙 Deploying Mock MNEE Token on Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  console.log("⏳ Deploying Mock MNEE...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mnee = await MockERC20.deploy(
    "MNEE USD Stablecoin",
    "MNEE",
    hre.ethers.parseEther("10000000")
  );

  await mnee.waitForDeployment();
  const mneeAddress = await mnee.getAddress();

  console.log("✅ Mock MNEE deployed to:", mneeAddress);
  
  console.log("⏳ Waiting for 3 confirmations...");
  await mnee.deploymentTransaction().wait(3);
  console.log("✅ Confirmed!\n");
  
  console.log("💰 Minting test tokens...");
  const mintTx = await mnee.mint(deployer.address, hre.ethers.parseEther("100000"));
  await mintTx.wait();
  console.log("✅ Minted 100,000 MNEE to:", deployer.address);

  console.log("\n=====================================");
  console.log("📋 MOCK MNEE DEPLOYMENT");
  console.log("=====================================");
  console.log("Contract:", mneeAddress);
  console.log("Network: Sepolia");
  console.log("Owner:", deployer.address);
  console.log("=====================================\n");

  console.log("📝 Add to .env: MNEE_SEPOLIA=" + mneeAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});