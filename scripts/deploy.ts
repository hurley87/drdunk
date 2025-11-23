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
 */
async function deploy() {
  const network = process.argv[2] || "base-sepolia";
  const isMainnet = network === "base";
  
  const chain = isMainnet ? base : baseSepolia;
  const usdcAddress = isMainnet ? USDC_BASE_MAINNET : USDC_BASE_SEPOLIA;
  
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY environment variable not set");
  }
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createPublicClient({
    chain,
    transport: http(),
  });
  
  console.log(`Deploying to ${network}...`);
  console.log(`USDC Address: ${usdcAddress}`);
  console.log(`Deployer: ${account.address}`);
  
  // Note: This is a TypeScript deployment script template
  // Actual deployment would use Foundry's forge script or a deployment framework
  // For now, this serves as a reference for the deployment parameters
  
  console.log("\nDeployment parameters:");
  console.log(`- Contract: DoctorDunk`);
  console.log(`- Constructor arg: ${usdcAddress}`);
  console.log(`- Chain: ${chain.name} (${chain.id})`);
  
  console.log("\nTo deploy with Foundry, use:");
  console.log(`forge create contracts/DoctorDunk.sol:DoctorDunk --constructor-args ${usdcAddress} --rpc-url ${network} --private-key $DEPLOYER_PRIVATE_KEY --verify`);
}

deploy().catch(console.error);

