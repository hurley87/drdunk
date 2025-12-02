// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {DoctorDunk} from "../src/DoctorDunk.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {ERC20} from "openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 1e6); // Mint 1M USDC
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract DoctorDunkTest is Test {
    DoctorDunk public doctorDunk;
    MockUSDC public usdc;
    address public owner = address(1);
    address public player1 = address(2);
    address public player2 = address(3);

    function setUp() public {
        vm.startPrank(owner);
        usdc = new MockUSDC();
        doctorDunk = new DoctorDunk(address(usdc));
        vm.stopPrank();

        // Give players some USDC
        vm.prank(owner);
        usdc.transfer(player1, 100 * 1e6);
        vm.prank(owner);
        usdc.transfer(player2, 100 * 1e6);
    }

    function testEnterGame() public {
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x1234567890abcdef");
        vm.stopPrank();

        uint256 roundId = doctorDunk.getCurrentRoundId();
        (address player, , , , ) = doctorDunk.getEntry(roundId, "0x1234567890abcdef");
        assertEq(player, player1);
    }

    function testCannotEnterTwice() public {
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 2e6);
        doctorDunk.enterGame("0x1234567890abcdef");
        vm.expectRevert("Already entered this round");
        doctorDunk.enterGame("0xabcdef1234567890");
        vm.stopPrank();
    }

    function testRecordEngagement() public {
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x1234567890abcdef");
        vm.stopPrank();

        uint256 roundId = doctorDunk.getCurrentRoundId();
        vm.prank(owner);
        doctorDunk.recordEngagement("0x1234567890abcdef", 10, 5, 3);

        (, uint256 likes, uint256 recasts, uint256 replies, uint256 score) =
            doctorDunk.getEntry(roundId, "0x1234567890abcdef");

        assertEq(likes, 10);
        assertEq(recasts, 5);
        assertEq(replies, 3);
        // Score = 10*1 + 5*2 + 3*3 = 10 + 10 + 9 = 29
        assertEq(score, 29);
    }

    function testFinalizeRound() public {
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x111");
        vm.stopPrank();

        vm.startPrank(player2);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x222");
        vm.stopPrank();

        uint256 roundId = doctorDunk.getCurrentRoundId();

        // Fast forward to end of round
        vm.warp((roundId + 1) * 86400);

        // Prepare engagement data for finalizeRound
        string[] memory castHashes = new string[](2);
        uint256[] memory likes = new uint256[](2);
        uint256[] memory recasts = new uint256[](2);
        uint256[] memory replies = new uint256[](2);
        
        castHashes[0] = "0x111";
        likes[0] = 5;
        recasts[0] = 2;
        replies[0] = 1; // Score: 5 + 4 + 3 = 12
        
        castHashes[1] = "0x222";
        likes[1] = 10;
        recasts[1] = 3;
        replies[1] = 2; // Score: 10 + 6 + 6 = 22

        vm.prank(owner);
        doctorDunk.finalizeRound(roundId, castHashes, likes, recasts, replies);

        (, , , address winner, , bool finalized, ) = doctorDunk.getRoundInfo(roundId);
        assertEq(winner, player2);
        assertTrue(finalized);
    }

    function testClaimReward() public {
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x111");
        vm.stopPrank();

        vm.startPrank(player2);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x222");
        vm.stopPrank();

        uint256 roundId = doctorDunk.getCurrentRoundId();
        
        // Set engagement scores - player2 wins
        vm.prank(owner);
        doctorDunk.recordEngagement("0x111", 5, 2, 1);
        vm.prank(owner);
        doctorDunk.recordEngagement("0x222", 10, 3, 2);

        // Fast forward to end of round
        vm.warp((roundId + 1) * 86400);

        // Prepare engagement data for finalizeRound
        string[] memory castHashes = new string[](2);
        uint256[] memory likes = new uint256[](2);
        uint256[] memory recasts = new uint256[](2);
        uint256[] memory replies = new uint256[](2);
        
        castHashes[0] = "0x111";
        likes[0] = 5;
        recasts[0] = 2;
        replies[0] = 1;
        
        castHashes[1] = "0x222";
        likes[1] = 10;
        recasts[1] = 3;
        replies[1] = 2;

        vm.prank(owner);
        doctorDunk.finalizeRound(roundId, castHashes, likes, recasts, replies);

        // Player2 claims reward
        uint256 balanceBefore = usdc.balanceOf(player2);
        vm.prank(player2);
        doctorDunk.claimDailyReward(roundId);
        uint256 balanceAfter = usdc.balanceOf(player2);

        // Should receive 1.8 USDC (2 entries * 0.9 USDC each after 10% fee)
        assertEq(balanceAfter - balanceBefore, 1800000); // 1.8 USDC = 1.8e6
    }

    function testFeeCollection() public {
        uint256 ownerBalanceBefore = usdc.balanceOf(owner);
        
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0x111");
        vm.stopPrank();

        uint256 ownerBalanceAfter = usdc.balanceOf(owner);
        
        // Owner should receive 0.1 USDC fee (10% of 1 USDC)
        assertEq(ownerBalanceAfter - ownerBalanceBefore, 100000); // 0.1 USDC = 0.1e6
    }

    function testSetTokenAddress() public {
        MockUSDC newUsdc = new MockUSDC();
        address newTokenAddress = address(newUsdc);
        
        vm.prank(owner);
        doctorDunk.setTokenAddress(newTokenAddress);
        
        assertEq(doctorDunk.getTokenAddress(), newTokenAddress);
    }

    function testSetTokenAddressOnlyOwner() public {
        MockUSDC newUsdc = new MockUSDC();
        address newTokenAddress = address(newUsdc);
        
        vm.prank(player1);
        vm.expectRevert();
        doctorDunk.setTokenAddress(newTokenAddress);
    }

    function testSetTokenAddressInvalidAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid token address");
        doctorDunk.setTokenAddress(address(0));
    }

    function testSetTokenAddressSameAddress() public {
        vm.prank(owner);
        vm.expectRevert("Same token address");
        doctorDunk.setTokenAddress(address(usdc));
    }

    function testSetEntryFee() public {
        uint256 newFee = 2e6; // 2 USDC
        
        vm.prank(owner);
        doctorDunk.setEntryFee(newFee);
        
        assertEq(doctorDunk.entryFee(), newFee);
    }

    function testSetEntryFeeOnlyOwner() public {
        vm.prank(player1);
        vm.expectRevert();
        doctorDunk.setEntryFee(2e6);
    }

    function testSetEntryFeeZero() public {
        vm.prank(owner);
        vm.expectRevert("Entry fee must be greater than 0");
        doctorDunk.setEntryFee(0);
    }

    function testSetEntryFeeAndEnterGame() public {
        uint256 newFee = 2e6; // 2 USDC
        
        // Update entry fee
        vm.prank(owner);
        doctorDunk.setEntryFee(newFee);
        
        // Give player more USDC
        vm.prank(owner);
        usdc.transfer(player1, 100 * 1e6);
        
        // Enter game with new fee
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), newFee);
        doctorDunk.enterGame("0xnewfee");
        vm.stopPrank();
        
        // Verify entry was created
        uint256 roundId = doctorDunk.getCurrentRoundId();
        (address player, , , , ) = doctorDunk.getEntry(roundId, "0xnewfee");
        assertEq(player, player1);
    }

    function testTieBreakerEarliestEntryWins() public {
        // Player1 enters first
        vm.startPrank(player1);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0xtie1");
        vm.stopPrank();

        // Player2 enters second
        vm.startPrank(player2);
        usdc.approve(address(doctorDunk), 1e6);
        doctorDunk.enterGame("0xtie2");
        vm.stopPrank();

        uint256 roundId = doctorDunk.getCurrentRoundId();

        // Fast forward to end of round
        vm.warp((roundId + 1) * 86400);

        // Prepare engagement data for finalizeRound (both have same score: 29)
        string[] memory castHashes = new string[](2);
        uint256[] memory likes = new uint256[](2);
        uint256[] memory recasts = new uint256[](2);
        uint256[] memory replies = new uint256[](2);
        
        castHashes[0] = "0xtie1";
        likes[0] = 10;
        recasts[0] = 5;
        replies[0] = 3; // Score: 10 + 10 + 9 = 29
        
        castHashes[1] = "0xtie2";
        likes[1] = 10;
        recasts[1] = 5;
        replies[1] = 3; // Score: 10 + 10 + 9 = 29

        vm.prank(owner);
        doctorDunk.finalizeRound(roundId, castHashes, likes, recasts, replies);

        (, , , address winner, , bool finalized, ) = doctorDunk.getRoundInfo(roundId);
        
        // Player1 should win because they entered first (earliest entry wins in tie)
        assertEq(winner, player1);
        assertTrue(finalized);
    }
}

