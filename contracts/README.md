# Doctor Dunk Game Contracts

This directory contains the smart contracts for the Doctor Dunk game, built using the [LazerForge](https://github.com/LazerTechnologies/LazerForge) template.

## Overview

The DoctorDunk contract implements a competitive Farcaster game where:
- Users pay 1 USDC to enter each day
- They submit a cast hash (dunk)
- Engagement metrics (likes, recasts, replies) are tracked
- Weighted scoring: `likes * 1 + recasts * 2 + replies * 3`
- Daily winner receives the entire pot

## Contracts

- **DoctorDunk.sol**: Main game contract with entry fee, engagement tracking, and reward distribution
- **IERC20.sol**: ERC20 interface for USDC token

## Setup

1. Install dependencies (submodules are already initialized):
```bash
cd contracts
forge install
```

2. Set up environment variables (create `.env` file):
```bash
PRIVATE_KEY=your_private_key
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e  # Base Sepolia
NETWORK=base_sepolia
BASESCAN_API_KEY=your_basescan_api_key
BASE_RPC_URL=https://sepolia.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Build

```bash
cd contracts
forge build
```

## Test

```bash
cd contracts
forge test
```

Run specific test:
```bash
forge test --match-contract DoctorDunkTest -vv
```

## Deploy

### Base Sepolia (Testnet)
```bash
cd contracts
forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \
  --rpc-url base_sepolia \
  --broadcast \
  --verify
```

### Base Mainnet
```bash
cd contracts
# Update USDC_ADDRESS in .env to mainnet address
forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk \
  --rpc-url base \
  --broadcast \
  --verify
```

## USDC Addresses

- **Base Mainnet**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Contract Functions

### Public Functions
- `enterGame(string castHash)`: Pay 1 USDC and submit a cast hash
- `claimDailyReward(uint256 roundId)`: Winner claims their reward
- `getCurrentRoundId()`: Get current UTC day round ID
- `getEntry(uint256 roundId, string castHash)`: Get entry details
- `getRoundInfo(uint256 roundId)`: Get round information
- `getRoundCastHashes(uint256 roundId)`: Get all cast hashes for a round

### Owner Functions
- `recordEngagement(string castHash, uint256 likes, uint256 recasts, uint256 replies)`: Update engagement metrics
- `finalizeRound(uint256 roundId)`: Finalize round and determine winner

## Testing

The test suite includes:
- Entry submission
- Duplicate entry prevention
- Engagement tracking
- Round finalization
- Reward claiming

Run tests:
```bash
forge test --match-contract DoctorDunkTest -vv
```

## Security

- Uses OpenZeppelin's `Ownable` and `ReentrancyGuard`
- Entry fee is enforced via ERC20 transfer
- One entry per user per round
- Winner verification before reward claim

## License

MIT
