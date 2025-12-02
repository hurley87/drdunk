// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {DoctorDunk} from "../src/DoctorDunk.sol";

/**
 * @title DeployDoctorDunk
 * @notice Deployment script for DoctorDunk contract
 * @dev Usage:
 *      Base Sepolia: forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk --rpc-url base_sepolia --broadcast --verify
 *      Base Mainnet: forge script script/DeployDoctorDunk.s.sol:DeployDoctorDunk --rpc-url base --broadcast --verify
 */
contract DeployDoctorDunk is Script {
    // USDC addresses
    address constant USDC_BASE_MAINNET = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        // Support both PRIVATE_KEY and DEPLOYER_PRIVATE_KEY for compatibility
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", vm.envUint("DEPLOYER_PRIVATE_KEY"));
        
        // Detect network from chain ID or use environment variable
        uint256 chainId = block.chainid;
        address usdcAddress;
        string memory network;
        
        // Base Mainnet chain ID: 8453
        // Base Sepolia chain ID: 84532
        if (chainId == 8453) {
            network = "base";
            usdcAddress = vm.envOr("USDC_ADDRESS", USDC_BASE_MAINNET);
        } else if (chainId == 84532) {
            network = "base_sepolia";
            usdcAddress = vm.envOr("USDC_ADDRESS", USDC_BASE_SEPOLIA);
        } else {
            // Fallback to environment variable or default to Base Sepolia
            network = vm.envOr("NETWORK", string("base_sepolia"));
            if (keccak256(bytes(network)) == keccak256(bytes("base"))) {
                usdcAddress = vm.envOr("USDC_ADDRESS", USDC_BASE_MAINNET);
            } else {
                usdcAddress = vm.envOr("USDC_ADDRESS", USDC_BASE_SEPOLIA);
            }
        }

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying DoctorDunk contract...");
        console.log("Network:", network);
        console.log("Chain ID:", chainId);
        console.log("USDC Address:", usdcAddress);
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        DoctorDunk doctorDunk = new DoctorDunk(usdcAddress);

        console.log("DoctorDunk deployed at:", address(doctorDunk));

        vm.stopBroadcast();
    }
}

