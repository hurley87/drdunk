// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IERC20.sol";
import {Ownable} from "openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DoctorDunk
 * @dev A competitive Farcaster game where users pay an entry fee in ERC20 tokens to submit a dunk (cast).
 *      At the end of each day, the cast with the highest weighted engagement score wins the pot.
 */
contract DoctorDunk is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    uint256 public entryFee = 1e6; // Entry fee amount (in token's smallest unit, e.g., 1e6 for 6 decimals)
    uint256 public constant FEE_PERCENTAGE = 10; // 10% fee
    uint256 public constant FEE_DENOMINATOR = 100;
    
    struct Entry {
        address player;
        string castHash;
        uint256 likes;
        uint256 recasts;
        uint256 replies;
        uint256 weightedScore;
        bool exists;
    }
    
    struct Round {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 potAmount;
        address winner;
        string winnerCastHash;
        bool finalized;
        mapping(string => Entry) entries;
        string[] castHashes;
    }
    
    mapping(uint256 => Round) public rounds;
    mapping(address => mapping(uint256 => bool)) public hasEntered; // player => roundId => hasEntered
    mapping(string => uint256) public castHashToRoundId;
    
    uint256 public currentRoundId;
    
    event GameEntered(
        uint256 indexed roundId,
        address indexed player,
        string castHash,
        uint256 amount
    );
    
    event EngagementUpdated(
        uint256 indexed roundId,
        string castHash,
        uint256 likes,
        uint256 recasts,
        uint256 replies,
        uint256 weightedScore
    );
    
    event RoundFinalized(
        uint256 indexed roundId,
        address indexed winner,
        string winnerCastHash,
        uint256 potAmount
    );
    
    event RewardClaimed(
        uint256 indexed roundId,
        address indexed winner,
        uint256 amount
    );
    
    event FeeCollected(
        address indexed recipient,
        uint256 amount
    );
    
    event TokenAddressUpdated(
        address indexed oldToken,
        address indexed newToken
    );
    
    event EntryFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    constructor(address _paymentToken) {
        require(_paymentToken != address(0), "Invalid token address");
        paymentToken = IERC20(_paymentToken);
        currentRoundId = getCurrentRoundId();
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Get the current round ID based on UTC day
     * @return roundId The current round ID (days since epoch)
     */
    function getCurrentRoundId() public view returns (uint256) {
        // UTC day boundary: days since epoch
        return block.timestamp / 86400;
    }
    
    /**
     * @dev Initialize a new round if needed
     */
    function _initializeRound(uint256 roundId) internal {
        Round storage round = rounds[roundId];
        if (round.roundId == 0) {
            round.roundId = roundId;
            round.startTime = (roundId * 86400);
            round.endTime = ((roundId + 1) * 86400) - 1;
            round.potAmount = 0;
            round.finalized = false;
        }
    }
    
    /**
     * @dev Enter the game by paying entry fee and submitting cast hash
     * @param castHash The hash/identifier of the cast
     */
    function enterGame(string memory castHash) external nonReentrant {
        uint256 roundId = getCurrentRoundId();
        _initializeRound(roundId);
        
        require(!hasEntered[msg.sender][roundId], "Already entered this round");
        require(bytes(castHash).length > 0, "Cast hash required");
        
        // Transfer payment token from player to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), entryFee),
            "Token transfer failed"
        );
        
        // Calculate fee (10% of entry fee)
        uint256 feeAmount = (entryFee * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 potContribution = entryFee - feeAmount;
        
        // Transfer fee to owner immediately
        if (feeAmount > 0 && owner() != address(0)) {
            require(
                paymentToken.transfer(owner(), feeAmount),
                "Fee transfer failed"
            );
            emit FeeCollected(owner(), feeAmount);
        }
        
        Round storage round = rounds[roundId];
        require(!round.finalized, "Round already finalized");
        
        // Check if cast hash already exists in this round
        require(!round.entries[castHash].exists, "Cast hash already used");
        
        // Create entry
        round.entries[castHash] = Entry({
            player: msg.sender,
            castHash: castHash,
            likes: 0,
            recasts: 0,
            replies: 0,
            weightedScore: 0,
            exists: true
        });
        
        round.castHashes.push(castHash);
        round.potAmount += potContribution; // Add 90% to pot
        hasEntered[msg.sender][roundId] = true;
        castHashToRoundId[castHash] = roundId;
        
        emit GameEntered(roundId, msg.sender, castHash, entryFee);
    }
    
    /**
     * @dev Update engagement metrics for a cast (DEPRECATED - kept for backward compatibility)
     * @notice This function is deprecated. Engagement is now provided directly to finalizeRound().
     *         Keeping this function for backward compatibility but it's no longer needed.
     * @param castHash The cast hash to update
     * @param likes Number of likes
     * @param recasts Number of recasts
     * @param replies Number of replies
     */
    function recordEngagement(
        string memory castHash,
        uint256 likes,
        uint256 recasts,
        uint256 replies
    ) external onlyOwner {
        uint256 roundId = castHashToRoundId[castHash];
        
        // Check if entry exists in round 0 (valid round ID) or if roundId > 0
        // Since mappings return 0 for uninitialized values, we need to verify the entry actually exists
        bool entryFound = false;
        if (roundId == 0) {
            // Check if entry exists in round 0 (round 0 is valid - January 1, 1970)
            entryFound = rounds[0].entries[castHash].exists;
        } else {
            // For roundId > 0, the mapping value is reliable
            entryFound = true;
        }
        require(entryFound, "Cast hash not found");
        
        Round storage round = rounds[roundId];
        require(!round.finalized, "Round finalized");
        require(round.entries[castHash].exists, "Entry not found");
        
        Entry storage entry = round.entries[castHash];
        entry.likes = likes;
        entry.recasts = recasts;
        entry.replies = replies;
        
        // Calculate weighted score: likes * 1 + recasts * 2 + replies * 3
        entry.weightedScore = likes + (recasts * 2) + (replies * 3);
        
        emit EngagementUpdated(roundId, castHash, likes, recasts, replies, entry.weightedScore);
    }
    
    /**
     * @dev Finalize a round and determine the winner
     * @param roundId The round ID to finalize
     * @param castHashes Array of cast hashes in the round (must match round.castHashes)
     * @param likes Array of like counts for each cast hash
     * @param recasts Array of recast counts for each cast hash
     * @param replies Array of reply counts for each cast hash
     * 
     * NOTE: Engagement data is provided off-chain (from Neynar API) and passed to this function.
     * This avoids the need to update engagement on-chain during the round, saving gas costs.
     * The contract validates that all cast hashes exist in the round before calculating winner.
     */
    function finalizeRound(
        uint256 roundId,
        string[] memory castHashes,
        uint256[] memory likes,
        uint256[] memory recasts,
        uint256[] memory replies
    ) external onlyOwner {
        Round storage round = rounds[roundId];
        require(round.roundId > 0, "Round not found");
        require(!round.finalized, "Round already finalized");
        require(block.timestamp >= round.endTime, "Round not ended");
        
        // Validate input arrays have same length
        require(
            castHashes.length == likes.length &&
            likes.length == recasts.length &&
            recasts.length == replies.length,
            "Array length mismatch"
        );
        require(castHashes.length == round.castHashes.length, "Cast hash count mismatch");
        
        address winner = address(0);
        string memory winnerCastHash = "";
        uint256 highestScore = 0;
        uint256 winnerIndex = 0;
        
        // Find entry with highest weighted score
        // In case of a tie, the earliest entry (first in array) wins
        for (uint256 i = 0; i < castHashes.length; i++) {
            // Verify cast hash exists in round
            require(round.entries[castHashes[i]].exists, "Cast hash not found in round");
            
            // Calculate weighted score: likes * 1 + recasts * 2 + replies * 3
            uint256 weightedScore = likes[i] + (recasts[i] * 2) + (replies[i] * 3);
            
            // Update entry with engagement data (for historical record)
            Entry storage entry = round.entries[castHashes[i]];
            entry.likes = likes[i];
            entry.recasts = recasts[i];
            entry.replies = replies[i];
            entry.weightedScore = weightedScore;
            
            // Track winner (earliest entry wins in case of tie)
            if (weightedScore > highestScore) {
                highestScore = weightedScore;
                winner = entry.player;
                winnerCastHash = entry.castHash;
                winnerIndex = i;
            }
        }
        
        round.winner = winner;
        round.winnerCastHash = winnerCastHash;
        round.finalized = true;
        
        emit RoundFinalized(roundId, winner, winnerCastHash, round.potAmount);
    }
    
    /**
     * @dev Claim reward for winning a round
     * @param roundId The round ID to claim reward for
     */
    function claimDailyReward(uint256 roundId) external nonReentrant {
        Round storage round = rounds[roundId];
        require(round.finalized, "Round not finalized");
        require(round.winner == msg.sender, "Not the winner");
        require(round.potAmount > 0, "No reward to claim");
        
        uint256 reward = round.potAmount;
        round.potAmount = 0;
        
        require(
            paymentToken.transfer(msg.sender, reward),
            "Token transfer failed"
        );
        
        emit RewardClaimed(roundId, msg.sender, reward);
    }
    
    /**
     * @dev Get entry details for a cast hash
     * @param roundId The round ID
     * @param castHash The cast hash
     * @return player The player address
     * @return likes Number of likes
     * @return recasts Number of recasts
     * @return replies Number of replies
     * @return weightedScore The weighted engagement score
     */
    function getEntry(
        uint256 roundId,
        string memory castHash
    ) external view returns (
        address player,
        uint256 likes,
        uint256 recasts,
        uint256 replies,
        uint256 weightedScore
    ) {
        Round storage round = rounds[roundId];
        Entry storage entry = round.entries[castHash];
        require(entry.exists, "Entry not found");
        
        return (
            entry.player,
            entry.likes,
            entry.recasts,
            entry.replies,
            entry.weightedScore
        );
    }
    
    /**
     * @dev Get round information
     * @param roundId The round ID
     * @return startTime Round start timestamp
     * @return endTime Round end timestamp
     * @return potAmount Total pot amount
     * @return winner Winner address
     * @return winnerCastHash Winner's cast hash
     * @return finalized Whether round is finalized
     * @return entryCount Number of entries
     */
    function getRoundInfo(uint256 roundId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 potAmount,
        address winner,
        string memory winnerCastHash,
        bool finalized,
        uint256 entryCount
    ) {
        Round storage round = rounds[roundId];
        require(round.roundId > 0, "Round not found");
        
        return (
            round.startTime,
            round.endTime,
            round.potAmount,
            round.winner,
            round.winnerCastHash,
            round.finalized,
            round.castHashes.length
        );
    }
    
    /**
     * @dev Get all cast hashes for a round (for leaderboard)
     * @param roundId The round ID
     * @return Array of cast hashes
     */
    function getRoundCastHashes(uint256 roundId) external view returns (string[] memory) {
        Round storage round = rounds[roundId];
        return round.castHashes;
    }
    
    /**
     * @dev Get the current token address
     * @return The address of the ERC20 token currently being used
     */
    function getTokenAddress() external view returns (address) {
        return address(paymentToken);
    }
    
    /**
     * @dev Update the token address (only owner)
     * @param _newTokenAddress The new ERC20 token address
     * 
     * NOTE: Changing the token mid-round means existing entries were made with the old token,
     * while new entries will use the new token. Each round's pot may contain different tokens.
     * Consider the fairness implications before changing tokens during an active round.
     */
    function setTokenAddress(address _newTokenAddress) external onlyOwner {
        require(_newTokenAddress != address(0), "Invalid token address");
        require(_newTokenAddress != address(paymentToken), "Same token address");
        
        address oldToken = address(paymentToken);
        paymentToken = IERC20(_newTokenAddress);
        
        emit TokenAddressUpdated(oldToken, _newTokenAddress);
    }
    
    /**
     * @dev Update the entry fee (only owner)
     * @param _newEntryFee The new entry fee amount (in token's smallest unit)
     * 
     * NOTE: Changing the entry fee mid-round means new entries will pay a different fee
     * than earlier entries in the same round. Each entry pays the fee that was active
     * at the time they entered. Consider the fairness implications before changing fees
     * during an active round.
     */
    function setEntryFee(uint256 _newEntryFee) external onlyOwner {
        require(_newEntryFee > 0, "Entry fee must be greater than 0");
        
        uint256 oldFee = entryFee;
        entryFee = _newEntryFee;
        
        emit EntryFeeUpdated(oldFee, _newEntryFee);
    }
    
    /**
     * @dev Update cast hash mapping (only owner)
     * This function allows updating the cast hash after the cast is posted
     * Frontend sends a temporary hash to enterGame(), then backend posts cast
     * and gets real hash. This function updates the mapping to use the real hash.
     * @param oldCastHash The temporary cast hash used in enterGame()
     * @param newCastHash The real cast hash from the posted cast
     */
    function updateCastHash(string memory oldCastHash, string memory newCastHash) external onlyOwner {
        uint256 roundId = castHashToRoundId[oldCastHash];
        
        // Check if entry exists in round 0 (valid round ID) or if roundId > 0
        // Since mappings return 0 for uninitialized values, we need to verify the entry actually exists
        bool entryFound = false;
        if (roundId == 0) {
            // Check if entry exists in round 0 (round 0 is valid - January 1, 1970)
            entryFound = rounds[0].entries[oldCastHash].exists;
        } else {
            // For roundId > 0, the mapping value is reliable
            entryFound = true;
        }
        require(entryFound, "Old cast hash not found");
        
        require(bytes(newCastHash).length > 0, "New cast hash required");
        
        // Check if new cast hash already exists
        // If mapping is non-zero, it exists in some round. If mapping is 0, check if it exists in round 0
        // (since round 0 entries will have mapping value of 0, which is indistinguishable from uninitialized)
        uint256 newHashRoundId = castHashToRoundId[newCastHash];
        bool newHashExists = (newHashRoundId != 0) || rounds[0].entries[newCastHash].exists;
        require(!newHashExists, "New cast hash already exists");
        
        Round storage round = rounds[roundId];
        require(!round.finalized, "Round finalized");
        require(round.entries[oldCastHash].exists, "Entry not found");
        require(!round.entries[newCastHash].exists, "New cast hash already used in round");
        
        // Update entry with new cast hash
        Entry storage entry = round.entries[oldCastHash];
        entry.castHash = newCastHash;
        
        // Move entry to new hash key
        round.entries[newCastHash] = entry;
        delete round.entries[oldCastHash];
        
        // Update castHashes array
        for (uint256 i = 0; i < round.castHashes.length; i++) {
            if (keccak256(bytes(round.castHashes[i])) == keccak256(bytes(oldCastHash))) {
                round.castHashes[i] = newCastHash;
                break;
            }
        }
        
        // Update mapping
        castHashToRoundId[newCastHash] = roundId;
        delete castHashToRoundId[oldCastHash];
        
        emit CastHashUpdated(roundId, oldCastHash, newCastHash);
    }
    
    event CastHashUpdated(
        uint256 indexed roundId,
        string oldCastHash,
        string newCastHash
    );
    
    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );
    
    /**
     * @dev Emergency withdrawal function for the contract owner
     * @notice Allows owner to withdraw tokens from the contract in emergency situations
     * @param amount The amount of tokens to withdraw (0 = withdraw all)
     * @param recipient The address to send tokens to (address(0) = send to owner)
     * 
     * WARNING: This function allows withdrawing tokens that may belong to active rounds.
     * Use with extreme caution. Only use in genuine emergency situations.
     * Consider the impact on active rounds before withdrawing.
     */
    function emergencyWithdraw(uint256 amount, address recipient) external onlyOwner nonReentrant {
        address withdrawTo = recipient == address(0) ? owner() : recipient;
        require(withdrawTo != address(0), "Invalid recipient");
        
        uint256 contractBalance = paymentToken.balanceOf(address(this));
        require(contractBalance > 0, "No tokens to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? contractBalance : amount;
        require(withdrawAmount <= contractBalance, "Insufficient balance");
        require(withdrawAmount > 0, "Amount must be greater than 0");
        
        require(
            paymentToken.transfer(withdrawTo, withdrawAmount),
            "Token transfer failed"
        );
        
        emit EmergencyWithdrawal(address(paymentToken), withdrawTo, withdrawAmount);
    }
    
    /**
     * @dev Emergency withdrawal for any ERC20 token (in case wrong tokens are sent)
     * @notice Allows owner to recover tokens that were accidentally sent to the contract
     * @param token The address of the token to withdraw
     * @param amount The amount of tokens to withdraw (0 = withdraw all)
     * @param recipient The address to send tokens to (address(0) = send to owner)
     * 
     * WARNING: This function allows withdrawing any ERC20 token.
     * Use with extreme caution. Only use to recover tokens sent by mistake.
     */
    function emergencyWithdrawToken(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner nonReentrant {
        require(token != address(0), "Invalid token address");
        address withdrawTo = recipient == address(0) ? owner() : recipient;
        require(withdrawTo != address(0), "Invalid recipient");
        
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance > 0, "No tokens to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? contractBalance : amount;
        require(withdrawAmount <= contractBalance, "Insufficient balance");
        require(withdrawAmount > 0, "Amount must be greater than 0");
        
        require(
            IERC20(token).transfer(withdrawTo, withdrawAmount),
            "Token transfer failed"
        );
        
        emit EmergencyWithdrawal(token, withdrawTo, withdrawAmount);
    }
    
    /**
     * @dev Get the contract's balance of the payment token
     * @return The balance of payment tokens held by the contract
     */
    function getContractBalance() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get the contract's balance of any ERC20 token
     * @param token The address of the token to check
     * @return The balance of tokens held by the contract
     */
    function getTokenBalance(address token) external view returns (uint256) {
        require(token != address(0), "Invalid token address");
        return IERC20(token).balanceOf(address(this));
    }
}

