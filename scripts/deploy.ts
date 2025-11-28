import { createPublicClient, http, parseEther, Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// USDC addresses
const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address;

/**
 * Deploy DoctorDunk contract
 * Usage: pnpm tsx scripts/deploy.ts [network]
 * Network: 'base' or 'base-sepolia' (default: base-sepolia)
 * 
 * Note: This script provides deployment parameters. Actual deployment uses Foundry.
 * For Base Mainnet deployment, use: ./scripts/deploy-base.sh
 */
async function deploy() {
  const network = process.argv[2] || "base-sepolia";
  const isMainnet = network === "base";
  
  const chain = isMainnet ? base : baseSepolia;
  const usdcAddress = isMainnet ? USDC_BASE_MAINNET : USDC_BASE_SEPOLIA;
  
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY or PRIVATE_KEY environment variable not set");
  }
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createPublicClient({
    chain,
    transport: http(),
  });
  
  console.log(`\n📋 Deployment Configuration for ${network.toUpperCase()}`);
  console.log("=" .repeat(50));
  console.log(`Network: ${network}`);
  console.log(`Chain: ${chain.name} (${chain.id})`);
  console.log(`USDC Address: ${usdcAddress}`);
  console.log(`Deployer: ${account.address}`);
  
  // Check balance
  try {
    const balance = await client.getBalance({ address: account.address });
    console.log(`Balance: ${(Number(balance) / 1e18).toFixed(4)} ETH`);
    if (balance === 0n) {
      console.warn("\n⚠️  Warning: Deployer wallet has 0 ETH. You need ETH for gas fees!");
    }
  } catch (error) {
    console.warn("\n⚠️  Could not check balance:", error);
  }
  
  console.log("\n📝 Deployment Parameters:");
  console.log(`- Contract: DoctorDunk`);
  console.log(`- Constructor arg: ${usdcAddress}`);
  
  console.log("\n🚀 To deploy with Foundry, run:");
  if (isMainnet) {
    console.log(`   cd contracts`);
    console.log(`   forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \\`);
    console.log(`       --rpc-url base \\`);
    console.log(`       --broadcast \\`);
    console.log(`       --verify`);
    console.log(`\n   OR use the deployment script:`);
    console.log(`   ./scripts/deploy-base.sh`);
  } else {
    console.log(`   cd contracts`);
    console.log(`   forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \\`);
    console.log(`       --rpc-url base_sepolia \\`);
    console.log(`       --broadcast \\`);
    console.log(`       --verify`);
  }
  
  console.log("\n📚 See DEPLOYMENT.md for detailed instructions.");
}

deploy().catch(console.error);

