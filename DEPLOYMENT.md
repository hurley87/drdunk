# DoctorDunk Contract Deployment Guide

This guide explains how to deploy the DoctorDunk contract to Base Mainnet.

## Prerequisites

1. **Foundry** - Already installed (forge version 1.4.3)
2. **Environment Variables** - Set up your deployment keys
3. **Base RPC URL** - Optional, defaults to `https://mainnet.base.org`
4. **Basescan API Key** - Optional, for contract verification

## Environment Setup

Create a `.env` file in the `contracts/` directory:

```bash
# Copy the example file
cp contracts/.env.example contracts/.env

# Edit contracts/.env and fill in your values
```

The `.env` file should contain:

```bash
# Required: Your deployer wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Custom Base RPC endpoint (defaults to https://mainnet.base.org)
BASE_RPC_URL=https://your-base-rpc-endpoint.com

# Optional: Basescan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key
```

**Note**: The `.env` file is automatically loaded by the deployment scripts using Foundry's `--env-file` flag. You can also export these variables in your shell if you prefer.

## USDC Token Address

The contract uses USDC on Base Mainnet:
- **USDC Address**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

This address is automatically used when deploying to Base Mainnet (chain ID: 8453).

## Deployment Methods

### Method 1: Using the Shell Script (Recommended)

```bash
# 1. Create and configure contracts/.env file
cp contracts/.env.example contracts/.env
# Edit contracts/.env with your PRIVATE_KEY and BASESCAN_API_KEY

# 2. Run the deployment script (it will automatically load contracts/.env)
./scripts/deploy-base.sh
```

The script will automatically load environment variables from `contracts/.env` file. If the file doesn't exist, it will check for environment variables exported in your shell.

### Method 2: Using Foundry Directly

```bash
cd contracts

# Option A: Use .env file (recommended)
forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \
    --rpc-url base \
    --broadcast \
    --verify \
    --env-file .env \
    -vvvv

# Option B: Use environment variables from shell
export PRIVATE_KEY=your_private_key_here
export BASESCAN_API_KEY=your_basescan_api_key  # Optional
forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \
    --rpc-url base \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvvv
```

### Method 3: Using TypeScript Script

```bash
# Set your private key (as DEPLOYER_PRIVATE_KEY)
export DEPLOYER_PRIVATE_KEY=your_private_key_here

# Run the TypeScript deployment script
pnpm tsx scripts/deploy.ts base
```

## Deployment Steps

1. **Build the contracts** (already done, but you can rebuild):
   ```bash
   cd contracts
   forge build
   ```

2. **Set up your environment variables**:
   ```bash
   # Create .env file in contracts directory
   cp contracts/.env.example contracts/.env
   # Edit contracts/.env with your values
   ```

   Or export them in your shell:
   ```bash
   export PRIVATE_KEY=your_private_key_here
   export BASESCAN_API_KEY=your_basescan_api_key  # Optional
   ```

3. **Deploy the contract**:
   ```bash
   # Using the shell script
   ./scripts/deploy-base.sh
   
   # OR using Foundry directly
   cd contracts
   forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \
       --rpc-url base \
       --broadcast \
       --verify
   ```

4. **Save the deployed contract address**:
   After deployment, update your `.env` file:
   ```bash
   GAME_CONTRACT_ADDRESS=<deployed_contract_address>
   NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=<deployed_contract_address>
   ```

## Post-Deployment

1. **Verify the contract** (if verification failed during deployment):
   ```bash
   forge verify-contract <contract_address> \
       src/DoctorDunk.sol:DoctorDunk \
       --chain-id 8453 \
       --etherscan-api-key $BASESCAN_API_KEY \
       --constructor-args $(cast abi-encode "constructor(address)" 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
   ```

2. **Test the contract**:
   - Check the contract on Basescan: `https://basescan.org/address/<contract_address>`
   - Verify the USDC token address is set correctly
   - Test entering the game with a small amount

3. **Update your application**:
   - Update environment variables with the contract address
   - Update frontend configuration
   - Test the integration

## Important Notes

- **Private Key Security**: Never commit your private key to version control
- **Gas Fees**: Ensure your deployer wallet has enough ETH for gas fees on Base
- **USDC Approval**: Users will need to approve the contract to spend their USDC before entering
- **Entry Fee**: The contract sets a default entry fee of 1 USDC (1e6 with 6 decimals)

## Troubleshooting

### "Insufficient funds" error
- Ensure your deployer wallet has enough ETH for gas fees

### "Contract verification failed"
- Make sure `BASESCAN_API_KEY` is set correctly
- Try verifying manually using the `forge verify-contract` command

### "RPC endpoint error"
- Check your `BASE_RPC_URL` is correct
- Try using the default endpoint: `https://mainnet.base.org`

## Contract Details

- **Contract Name**: DoctorDunk
- **Payment Token**: USDC (Base Mainnet)
- **USDC Address**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Entry Fee**: 1 USDC (configurable by owner)
- **Fee Percentage**: 10% (goes to contract owner)
- **Pot Percentage**: 90% (goes to winner)

