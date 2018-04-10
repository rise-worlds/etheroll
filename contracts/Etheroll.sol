pragma solidity ^0.4.17;


contract Etheroll {
    /*
      * checks player profit, bet size and player number is within range
    */
    modifier betIsValid(uint _betSize, uint _playerNumber) {
        require(((((_betSize * (100-(safeSub(_playerNumber,1)))) / (safeSub(_playerNumber,1))+_betSize))*houseEdge/houseEdgeDivisor)-_betSize <= maxProfit || _betSize >= minBet || _playerNumber >= minNumber || _playerNumber <= maxNumber);
        _;
    }

    /*
      * checks game is currently active
    */
    modifier gameIsActive {
        require(gamePaused != true);
        _;
    }

    /*
      * checks payouts are currently active
    */
    modifier payoutsAreActive {
        require(payoutsPaused != true);
        _;
    }

    /*
      * checks only owner address is calling
    */
    modifier onlyOwner {
        require (msg.sender == owner);
        _;
    }

    /*
      * checks only treasury address is calling
    */
    modifier onlyTreasury {
        require (msg.sender == treasury);
        _;
    }

    /*
     * game vars
     */
    uint constant public maxProfitDivisor = 1000000;
    uint constant public houseEdgeDivisor = 1000;
    uint constant public maxNumber = 99;
    uint constant public minNumber = 2;
    bool public gamePaused;
    // uint32 public gasForOraclize;
    address public owner;
    bool public payoutsPaused;
    address public treasury;
    uint public contractBalance;
    uint public houseEdge;
    uint public maxProfit;
    uint public maxProfitAsPercentOfHouse;
    uint public minBet;
    //init discontinued contract data
    int public totalBets = 244612;
    uint public maxPendingPayouts;
    //init discontinued contract data
    uint public totalWeiWon = 110633844560463069959901;
    //init discontinued contract data
    uint public totalWeiWagered = 316486087709317593009320;

    /*
     * player vars
     */
    mapping (bytes32 => address) playerAddress;
    mapping (bytes32 => address) playerTempAddress;
    mapping (bytes32 => bytes32) playerBetId;
    mapping (bytes32 => uint) playerBetValue;
    mapping (bytes32 => uint) playerTempBetValue;
    mapping (bytes32 => uint) playerRandomResult;
    mapping (bytes32 => uint) playerDieResult;
    mapping (bytes32 => uint) playerNumber;
    mapping (address => uint) playerPendingWithdrawals;
    mapping (bytes32 => uint) playerProfit;
    mapping (bytes32 => uint) playerTempReward;

    /*
    * events
    */
    /* log bets + output to web3 for precise 'payout on win' field in UI */
    event LogBet(bytes32 indexed BetID, address indexed PlayerAddress, uint indexed RewardValue, uint ProfitValue, uint BetValue, uint PlayerNumber);
    /* output to web3 UI on bet result*/
    /* Status: 0=lose, 1=win, 2=win + failed send, 3=refund, 4=refund + failed send*/
    event LogResult(uint indexed ResultSerialNumber, bytes32 indexed BetID, address indexed PlayerAddress, uint PlayerNumber, uint DiceResult, uint Value, int Status, uint RandomSeed);
    /* log manual refunds */
    event LogRefund(bytes32 indexed BetID, address indexed PlayerAddress, uint indexed RefundValue);
    /* log owner transfers */
    event LogOwnerTransfer(address indexed SentToAddress, uint indexed AmountTransferred);

    /*
    * init
    */
    function Etheroll() public {
        owner = msg.sender;
        treasury = msg.sender;
        // // oraclize_setNetwork(networkID_auto);
        // // /* use TLSNotary for oraclize call */
        // // oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        /* init 990 = 99% (1% houseEdge)*/
        ownerSetHouseEdge(990);
        /* init 10,000 = 1%  */
        ownerSetMaxProfitAsPercentOfHouse(10000);
        /* init min bet (0.1 ether) */
        ownerSetMinBet(100000000000000000);
        // /* init gas for oraclize */
        // gasForOraclize = 235000;
        // // /* init gas price for callback (default 20 gwei)*/
        // // oraclize_setCustomGasPrice(20000000000 wei);
    }

    function rand() public view returns(uint256) {
        uint256 random = uint256(keccak256(block.difficulty,now));
        return random;
    }

    /*
    * public function
    * player submit bet
    * only if game is active & bet is valid can query oraclize and set player vars
    */
    function playerRollDice(uint rollUnder) public
        payable
    // gameIsActive
    // betIsValid(msg.value, rollUnder)
	{
        /*
        * assign partially encrypted query to oraclize
        * only the apiKey is encrypted
        * integer query is in plain text
        */
        bytes32 rngId = keccak256(block.difficulty, block.timestamp);

        /* map bet id to this oraclize query */
        playerBetId[rngId] = rngId;
        /* map player lucky number to this oraclize query */
        playerNumber[rngId] = rollUnder;
        /* map value of wager to this oraclize query */
        playerBetValue[rngId] = msg.value;
        /* map player address to this oraclize query */
        playerAddress[rngId] = msg.sender;
        /* safely map player profit to this oraclize query */
        playerProfit[rngId] = ((((msg.value * (100-(safeSub(rollUnder,1)))) / (safeSub(rollUnder,1))+msg.value))*houseEdge/houseEdgeDivisor)-msg.value;
        /* safely increase maxPendingPayouts liability - calc all pending payouts under assumption they win */
        maxPendingPayouts = safeAdd(maxPendingPayouts, playerProfit[rngId]);
        /* check contract can payout on win */
        assert (maxPendingPayouts < contractBalance);
        /* provides accurate numbers for web3 and allows for manual refunds in case of no oraclize __callback */
        LogBet(rngId, msg.sender, safeAdd(msg.value, playerProfit[rngId]), playerProfit[rngId], msg.value, rollUnder);
    // }
    //
    // function __callback(bytes32 rngId, string result, bytes proof) public
    // {
        /* player address mapped to query id does not exist */
        assert (playerAddress[rngId]!=0x0);

        uint serialNumberOfResult = uint(rand());

        /* map random result to player */
        playerRandomResult[rngId] = uint(rand());

        /* produce integer bounded to 1-100 inclusive
        *  via sha3 result from random.org and proof (IPFS address of TLSNotary proof)
        */
        playerDieResult[rngId] = uint(playerRandomResult[rngId]) % 100 + 1;

        /* get the playerAddress for this query id */
        playerTempAddress[rngId] = playerAddress[rngId];
        /* delete playerAddress for this query id */
        delete playerAddress[rngId];

        /* map the playerProfit for this query id */
        playerTempReward[rngId] = playerProfit[rngId];
        /* set  playerProfit for this query id to 0 */
        playerProfit[rngId] = 0;

        /* safely reduce maxPendingPayouts liability */
        maxPendingPayouts = safeSub(maxPendingPayouts, playerTempReward[rngId]);

        /* map the playerBetValue for this query id */
        playerTempBetValue[rngId] = playerBetValue[rngId];
        /* set  playerBetValue for this query id to 0 */
        playerBetValue[rngId] = 0;

        /* total number of bets */
        totalBets += 1;

        /* total wagered */
        totalWeiWagered += playerTempBetValue[rngId];

        /*
        * pay winner
        * update contract balance to calculate new max bet
        * send reward
        * if send of reward fails save value to playerPendingWithdrawals
        */
        if(playerDieResult[rngId] < playerNumber[rngId]){
            /* safely reduce contract balance by player profit */
            contractBalance = safeSub(contractBalance, playerTempReward[rngId]);

            /* update total wei won */
            totalWeiWon = safeAdd(totalWeiWon, playerTempReward[rngId]);

            /* safely calculate payout via profit plus original wager */
            playerTempReward[rngId] = safeAdd(playerTempReward[rngId], playerTempBetValue[rngId]);

            LogResult(serialNumberOfResult, rngId, playerTempAddress[rngId], playerNumber[rngId], playerDieResult[rngId], playerTempReward[rngId], 1, playerRandomResult[rngId]);

            /* update maximum profit */
            setMaxProfit();

            /*
            * send win - external call to an untrusted contract
            * if send fails map reward value to playerPendingWithdrawals[address]
            * for withdrawal later via playerWithdrawPendingTransactions
            */
            if(!playerTempAddress[rngId].send(playerTempReward[rngId])){
                LogResult(serialNumberOfResult, rngId, playerTempAddress[rngId], playerNumber[rngId], playerDieResult[rngId], playerTempReward[rngId], 2, playerRandomResult[rngId]);
                /* if send failed let player withdraw via playerWithdrawPendingTransactions */
                playerPendingWithdrawals[playerTempAddress[rngId]] = safeAdd(playerPendingWithdrawals[playerTempAddress[rngId]], playerTempReward[rngId]);
            }

            return;
        }

        /*
        * no win
        * send 1 wei to a losing bet
        * update contract balance to calculate new max bet
        */
        if(playerDieResult[rngId] >= playerNumber[rngId]){
            LogResult(serialNumberOfResult, rngId, playerTempAddress[rngId], playerNumber[rngId], playerDieResult[rngId], playerTempBetValue[rngId], 0, playerRandomResult[rngId]);

            /*
            *  safe adjust contractBalance
            *  setMaxProfit
            *  send 1 wei to losing bet
            */
            contractBalance = safeAdd(contractBalance, (playerTempBetValue[rngId]-1));

            /* update maximum profit */
            setMaxProfit();

            /*
            * send 1 wei - external call to an untrusted contract
            */
            if(!playerTempAddress[rngId].send(1)){
                /* if send failed let player withdraw via playerWithdrawPendingTransactions */
                playerPendingWithdrawals[playerTempAddress[rngId]] = safeAdd(playerPendingWithdrawals[playerTempAddress[rngId]], 1);
            }

            return;
        }
    }

    /*
    * public function
    * in case of a failed refund or win send
    */
    function playerWithdrawPendingTransactions() public
        payoutsAreActive
        returns (bool)
    {
        uint withdrawAmount = playerPendingWithdrawals[msg.sender];
        playerPendingWithdrawals[msg.sender] = 0;
        /* external call to untrusted contract */
        if (msg.sender.call.value(withdrawAmount)()) {
            return true;
        } else {
            /* if send failed revert playerPendingWithdrawals[msg.sender] = 0; */
            /* player can try to withdraw again later */
            playerPendingWithdrawals[msg.sender] = withdrawAmount;
            return false;
        }
    }

    /* check for pending withdrawals  */
    function playerGetPendingTxByAddress(address addressToCheck) public constant returns (uint) {
        return playerPendingWithdrawals[addressToCheck];
    }

    /*
    * internal function
    * sets max profit
    */
    function setMaxProfit() internal {
        maxProfit = (contractBalance*maxProfitAsPercentOfHouse)/maxProfitDivisor;
    }

//   /*
//   * player check provably fair
//   */
//   function playerCheckProvablyFair(uint randomResult, bytes proof) public constant returns (uint) {
//     return uint(sha3(randomResult, proof)) % 100 + 1;
//   }

    /*
    * owner/treasury address only functions
    */
    function () public
        payable
        onlyTreasury
    {
        /* safely update contract balance */
        contractBalance = safeAdd(contractBalance, msg.value);
        /* update the maximum profit */
        setMaxProfit();
    }

//   // /* set gas price for oraclize callback */
//   // function ownerSetCallbackGasPrice(uint newCallbackGasPrice) public
// 	// 	onlyOwner
// 	// {
//   //   oraclize_setCustomGasPrice(newCallbackGasPrice);
//   // }

//   /* set gas limit for oraclize query */
//   function ownerSetOraclizeSafeGas(uint32 newSafeGasToOraclize) public
// 		onlyOwner
// 	{
//     gasForOraclize = newSafeGasToOraclize;
//   }

//   /* only owner adjust contract balance variable (only used for max profit calc) */
//   function ownerUpdateContractBalance(uint newContractBalanceInWei) public
// 		onlyOwner
//   {
//     contractBalance = newContractBalanceInWei;
//   }

    /* only owner address can set houseEdge */
    function ownerSetHouseEdge(uint newHouseEdge) public
        onlyOwner
    {
        houseEdge = newHouseEdge;
    }

    /* only owner address can set maxProfitAsPercentOfHouse */
    function ownerSetMaxProfitAsPercentOfHouse(uint newMaxProfitAsPercent) public
        onlyOwner
    {
        /* restrict each bet to a maximum profit of 1% contractBalance */
        assert (newMaxProfitAsPercent <= 10000);
        maxProfitAsPercentOfHouse = newMaxProfitAsPercent;
        setMaxProfit();
    }

    /* only owner address can set minBet */
    function ownerSetMinBet(uint newMinimumBet) public
        onlyOwner
    {
        minBet = newMinimumBet;
    }

//   /* only owner address can transfer ether */
//   function ownerTransferEther(address sendTo, uint amount) public
// 		onlyOwner
//   {
//     /* safely update contract balance when sending out funds*/
//     contractBalance = safeSub(contractBalance, amount);
//     /* update max profit */
//     setMaxProfit();
//     if(!sendTo.send(amount)) throw;
//     LogOwnerTransfer(sendTo, amount);
//   }

//   /* only owner address can do manual refund
//   * used only if bet placed + oraclize failed to __callback
//   * filter LogBet by address and/or playerBetId:
//   * LogBet(playerBetId[rngId], playerAddress[rngId], safeAdd(playerBetValue[rngId], playerProfit[rngId]), playerProfit[rngId], playerBetValue[rngId], playerNumber[rngId]);
//   * check the following logs do not exist for playerBetId and/or playerAddress[rngId] before refunding:
//   * LogResult or LogRefund
//   * if LogResult exists player should use the withdraw pattern playerWithdrawPendingTransactions
//   */
//   function ownerRefundPlayer(bytes32 originalPlayerBetId, address sendTo, uint originalPlayerProfit, uint originalPlayerBetValue) public
// 		onlyOwner
//   {
//     /* safely reduce pendingPayouts by playerProfit[rngId] */
//     maxPendingPayouts = safeSub(maxPendingPayouts, originalPlayerProfit);
//     /* send refund */
//     if(!sendTo.send(originalPlayerBetValue)) throw;
//     /* log refunds */
//     LogRefund(originalPlayerBetId, sendTo, originalPlayerBetValue);
//   }

//   /* only owner address can set emergency pause #1 */
//   function ownerPauseGame(bool newStatus) public
// 		onlyOwner
//   {
//     gamePaused = newStatus;
//   }

//   /* only owner address can set emergency pause #2 */
//   function ownerPausePayouts(bool newPayoutStatus) public
// 		onlyOwner
//   {
//   payoutsPaused = newPayoutStatus;
//   }

//   /* only owner address can set treasury address */
//   function ownerSetTreasury(address newTreasury) public
// 		onlyOwner
// 	{
//     treasury = newTreasury;
//   }

//   /* only owner address can set owner address */
//   function ownerChangeOwner(address newOwner) public
// 		onlyOwner
// 	{
//     owner = newOwner;
//   }

//   /* only owner address can suicide - emergency */
//   function ownerkill() public
// 		onlyOwner
// 	{
// 		suicide(owner);
// 	}

    function safeToAdd(uint a, uint b) internal pure returns (bool) {
        return (a + b >= a);
    }
    function safeAdd(uint a, uint b) internal pure returns (uint) {
        assert (safeToAdd(a, b));
        return a + b;
    }

    function safeToSubtract(uint a, uint b) internal pure returns (bool) {
        return (b <= a);
    }

    function safeSub(uint a, uint b) internal pure returns (uint) {
        assert (safeToSubtract(a, b));
        return a - b;
    }

    // parseInt
    function parseInt(string _a) internal returns (uint) {
        return parseInt(_a, 0);
    }

    // parseInt(parseFloat*10^_b)
    function parseInt(string _a, uint _b) internal returns (uint) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        bool decimals = false;
        for (uint i = 0; i < bresult.length; i++){
            if ((bresult[i] >= 48)&&(bresult[i] <= 57)){
                if (decimals){
                    if (_b == 0) break;
                    else _b--;
                }
                mint *= 10;
                mint += uint(bresult[i]) - 48;
            } else if (bresult[i] == 46) decimals = true;
        }
        if (_b > 0) mint *= 10**_b;
        return mint;
    }
}
