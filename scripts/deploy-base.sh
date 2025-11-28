#!/bin/bash

# Deployment script for DoctorDunk contract to Base Mainnet
# This script deploys the contract using Foundry's forge script
# It loads environment variables from contracts/.env file

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}DoctorDunk Contract Deployment to Base Mainnet${NC}"
echo "=========================================="

# Navigate to contracts directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACTS_DIR="$SCRIPT_DIR/../contracts"
cd "$CONTRACTS_DIR"

# Check if .env file exists
ENV_FILE="$CONTRACTS_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: .env file not found in contracts directory${NC}"
    echo "Creating .env.example as a template..."
    if [ -f "$CONTRACTS_DIR/.env.example" ]; then
        echo "Please copy .env.example to .env and fill in your values:"
        echo "  cp contracts/.env.example contracts/.env"
        echo "  # Then edit contracts/.env with your values"
    fi
    
    # Check if environment variables are set directly
    if [ -z "$PRIVATE_KEY" ] && [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
        echo -e "${RED}Error: No .env file found and PRIVATE_KEY not set${NC}"
        echo "Please either:"
        echo "  1. Create contracts/.env file with PRIVATE_KEY=your_key"
        echo "  2. Or export PRIVATE_KEY=your_key before running this script"
        exit 1
    else
        echo -e "${YELLOW}Using environment variables from shell instead of .env file${NC}"
        ENV_FILE_FLAG=""
    fi
else
    echo -e "${GREEN}Loading environment variables from contracts/.env${NC}"
    ENV_FILE_FLAG="--env-file .env"
fi

# Load .env file if it exists (for checking values)
if [ -f "$ENV_FILE" ]; then
    # Source the .env file to check for PRIVATE_KEY
    set -a
    source "$ENV_FILE"
    set +a
fi

# Check if PRIVATE_KEY or DEPLOYER_PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ] && [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY or DEPLOYER_PRIVATE_KEY must be set${NC}"
    echo "Please set it in contracts/.env file or export it:"
    echo "  export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Use PRIVATE_KEY if set, otherwise use DEPLOYER_PRIVATE_KEY
DEPLOYER_KEY="${PRIVATE_KEY:-$DEPLOYER_PRIVATE_KEY}"

# Check if BASESCAN_API_KEY is set (for verification)
if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${YELLOW}Warning: BASESCAN_API_KEY is not set. Contract will not be verified.${NC}"
    echo "Set it in contracts/.env file or export it:"
    echo "  export BASESCAN_API_KEY=your_basescan_api_key"
    VERIFY_FLAG=""
else
    VERIFY_FLAG="--verify"
fi

# Check if BASE_RPC_URL is set, otherwise use default
if [ -z "$BASE_RPC_URL" ]; then
    echo -e "${YELLOW}Using default Base RPC: https://mainnet.base.org${NC}"
    echo "To use a custom RPC, set BASE_RPC_URL in contracts/.env"
fi

# USDC address on Base Mainnet
USDC_BASE_MAINNET="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

echo ""
echo "Deployment Configuration:"
echo "  Network: Base Mainnet"
echo "  USDC Address: $USDC_BASE_MAINNET"
echo "  Deployer: $(cast wallet address $DEPLOYER_KEY 2>/dev/null || echo 'Unable to derive address')"
echo "  Env File: ${ENV_FILE_FLAG:-'Using shell environment variables'}"
echo ""

# Confirm deployment
read -p "Do you want to proceed with deployment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Building contracts...${NC}"
forge build

echo ""
echo -e "${GREEN}Deploying contract...${NC}"

# Build forge command array
FORGE_ARGS=(
    "script" "script/DeployDoctorDunk.s.sol:DeployDoctorDunk"
    "--rpc-url" "base"
    "--broadcast"
)

# Add verification if enabled
if [ -n "$VERIFY_FLAG" ]; then
    FORGE_ARGS+=("--verify")
    if [ -n "$BASESCAN_API_KEY" ]; then
        FORGE_ARGS+=("--etherscan-api-key" "$BASESCAN_API_KEY")
    fi
fi

# Add env-file flag if .env exists
if [ -n "$ENV_FILE_FLAG" ]; then
    FORGE_ARGS+=("--env-file" ".env")
fi

# Add verbosity
FORGE_ARGS+=("-vvvv")

# Execute the command
forge "${FORGE_ARGS[@]}"

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the deployed contract address:"
echo "   GAME_CONTRACT_ADDRESS=<deployed_address>"
echo "   NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=<deployed_address>"
echo ""
echo "2. Verify the contract on Basescan (if verification failed)"
echo "3. Test the contract functions"

