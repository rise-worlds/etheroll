App = {
    web3Provider: null,
    contracts: {},
    adoptionInstance:null,
    account:null,
    _betValue : 1,
    _maxBet:null,
    _maxProfit:null,
    _maxWin:null,
    _houseEdge : 990,
    _minBet:null,
    _rollUnder:null,
    _yourBet:null,
    _yourProfit:null,
    _isPlaying : false,
    _blockNumberAtTimeOfBet:null,
    _blocksToGo:null,
    _blockNumberInterval:null,
    theBlockNumberNow:null,
    currentBlock:null,
    getSinceBlock:null,
    allResultEvents:null,

    init: function() {
      /*
       * Is there an injected web3 instance ?
       */
      if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider;
      } else {
          // If no injected web3 instance is detected, fall back to Ganache
          App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      }
      web3 = new Web3(App.web3Provider);

      return App.initContract();
    },

    initContract: function() {
        $('#loader').hide();
        $('#content').show();
        $('#myModal').modal('show');
        $(".txhash" ).hide();

    //terms modal
        $("#terms-agree").click(function (e) {
            $('#myModal').modal('hide');
        });

        $("#terms-disagree").click(function (e) {
            window.location.href = "http://www.google.com";
        });

        $('#tab').easyResponsiveTabs({tabidentify: 'vert'});


//pies
var pie1 = new d3pie("pieChart1", {
    "header": {
        "title": {
            "color": "#000000",
            "fontSize": 16,
            "font": "Muli, sans-serif"
        },
        "subtitle": {
            "color": "#000000",
            "fontSize": 16,
            "font": "Muli, sans-serif"
        },
        "location": "top-left",
        "titleSubtitlePadding": 12
    },
    "footer": {
        "color": "#999999",
        "fontSize": 16,
        "font": "open sans",
        "location": "bottom-center"
    },
    "size": {
        "canvasHeight": 400,
        "canvasWidth": 590,
        "pieInnerRadius": "65%",
        "pieOuterRadius": "80%"
    },
    "data": {
        "content": [
            {
                "label": "Token holders",
                "value": 100,
                "color": "#2ab27b"
            }
        ]
    },
    "labels": {
        "outer": {
            "format": "label-value1",
            "pieDistance": 28
        },
        "inner": {
            "format": "value"
        },
        "mainLabel": {
            "font": "Muli, sans-serif",
            "fontSize": 16
        },
        "percentage": {
            "color": "#e1e1e1",
            "font": "Muli, sans-serif",
            "fontSize": 16,
            "decimalPlaces": 0
        },
        "value": {
            "color": "#ffffff",
            "font": "Muli, sans-serif",
            "fontSize": 16
        },
        "lines": {
            "enabled": true
        },
        "truncation": {
            "enabled": true
        }
    },
    "effects": {
        "pullOutSegmentOnClick": {
            "effect": "back",
            "speed": 400,
            "size": 8
        }
    }
});

//init slider vars
var percentChanceOfWin = 50;
var percentChanceOfLoss = 50;
var payoutOnWin;

//slider
$("#slider").slider({
    value: 51,
    min: 2,
    max: 99,
    step: 1,
    slide: function (event, ui) {
        $("#bet-number").val($("#slider").slider("value"));
        percentChanceOfWin = $("#slider").slider("value") - 1;
        percentChanceOfLoss = 100 - percentChanceOfWin;
        payoutOnWin = ((percentChanceOfLoss / percentChanceOfWin) * App._betValue);
        $(".bet-payout").val(payoutOnWin);
        $("#chanceOfWin").val(percentChanceOfWin + '%');
        $("#chanceOfLoss").val(percentChanceOfLoss);
        App.getPayout();

    },
    stop: function (event, ui) {
        $("#bet-number").val($("#slider").slider("value"));
        percentChanceOfWin = $("#slider").slider("value") - 1;
        percentChanceOfLoss = 100 - percentChanceOfWin;
        payoutOnWin = ((percentChanceOfLoss / percentChanceOfWin) * App._betValue);
        $(".bet-payout").val(payoutOnWin);
        $("#chanceOfWin").val(percentChanceOfWin + '%');
        $("#chanceOfLoss").val(percentChanceOfLoss);
        App.getPayout();
    }
});

$("#bet-number").val($("#slider").slider("value"));

//init bet UI
$("#chanceOfWin").val(50 + '%');
$("#chanceOfLoss").val(50);
$(".bet-amount").val(App._betValue);
$(".bet-amount-wei").val(web3.toWei(App._betValue, 'ether'));

BigNumber.config({DECIMAL_PLACES: 18});
pCOL = new BigNumber(percentChanceOfLoss);
pCOW = new BigNumber(percentChanceOfWin);
x = new BigNumber(pCOL.div(pCOW));
y = new BigNumber((x.times(App._betValue)).plus(App._betValue));
xy = new BigNumber(y.times(App._houseEdge).div(1000));
z = new BigNumber(xy);
//$(".bet-payout").val(z-_betValue);
$(".bet-payout").val( z.minus(App._betValue));

//BETTING UI
//pre-selected bet values
$(".pre-paid").click(function () {
    App._betValue = $(this).val();
    App.updateBetData();
});

//change bets UI
$("#the-bet").change(function () {
    App._betValue = $(this).val();
    App.updateBetData();
});

$('.generating-normal').show();
$('.generating-wait').hide();

web3.eth.getAccounts(function(error, accounts) {
    if (error) {
        console.log(error);
    }

    App.account = accounts[0];

    //show banner data when connected
    $(".banner-data-section").show();
    $(".alert h1").addClass('title-connected');
});
      /*
       * load Adoption.json, save Adoption's ABI
       */
      $.getJSON('Etheroll.json', function(data) {
          // use Etheroll.json create a TruffleContract
          var AdoptionArtifact = data;
          App.contracts.Adoption = TruffleContract(AdoptionArtifact);
          // set the provider for our contract
          App.contracts.Adoption.setProvider(App.web3Provider);

            $('#loader').hide();
            $('#content').show();
            $('#myModal').modal('show');
            $(".txhash" ).hide();

            //terms modal
            $("#terms-agree").click(function (e) {
                $('#myModal').modal('hide');
            });

            $("#terms-disagree").click(function (e) {
                window.location.href = "http://www.google.com";
            });


            //
            $("#place-bet").click(function () {
                $(".warning-min-bet").hide();
                //$(".warning-max-bet").hide();
                $(".warning-max-profit").hide();

                //player wager
                App._yourBet = $(".bet-amount").val();
                //player die roll
                App._rollUnder = $('#bet-number').val();
                //is profit within range?
                if (z-App._betValue > App._maxBet) {
                    $(".warning-max-profit").show().text('Maximum profit is ' + App._maxBet);
                    return;
                }

                if (App._yourBet < App._minBet) {
                    $(".warning-min-bet").show().text('Minimum wager is ' + App._minBet);
                    return;
                }
                //is bet number and bet value is within range?
                if ((App._yourBet != '') && (App._rollUnder != '') && (App._rollUnder < 100) && (App._rollUnder > 1)) {

                // var adoptionInstance;
                // App.contracts.Adoption.deployed().then(function(instance) {
                //     adoptionInstance = instance;
                //
                //     // Execute adopt as a transaction by sending account
                //     return adoptionInstance.playerRollDice(App._rollUnder, {from: App.account, value: web3.toWei(App._yourBet, "ether")})
                // }).then(function(result) {
                //     console.log(result);
                //     // updated 100% accurate reward from solidity
                //     var _LogBet = adoptionInstance.LogBet({PlayerAddress: App.account}, {
                //         fromBlock: 'latest',
                //         toBlock: 'latest'
                //     });
                //     _LogBet.watch(function (err, result) {
                //         if (err) {
                //             console.log(err)
                //             return;
                //         }
                //         var ProfitValue = new BigNumber(web3.fromWei(result.args.ProfitValue, 'ether'));
                //         $(".bet-payout").val(ProfitValue);
                //         _LogBet.stopWatching();
                //     });
                //     // return App.markAdopted();
                // }).catch(function(err) {
                //     console.log(err.message);
                // });

                // var adoptionInstance;
                // App.contracts.Adoption.deployed().then(function(instance) {
                //    adoptionInstance = instance;

                   App.adoptionInstance.playerRollDice.sendTransaction(App._rollUnder, {
                        from: App.account,
                        value: web3.toWei(App._yourBet, "ether"),
                        //to: App.adoptionInstance.address,
                        //gas: 250000
                    }).then(function(transactionHash){
                        //if (!transactionHash){
                            console.log(transactionHash);
                        //}

                        $("#win").hide();
                        $("#lose").hide();
                        $("#refund").hide();
                        $('.bet-payout').removeClass('red');
                        $('.bet-payout').removeClass('green');

                        $('#blocks-to-go').val('Mining ~3 blocks...');
                        $('#blocks-to-go').addClass('highlight');

                        $('.txhash').html('<a href="https://etherscan.io/tx/' + transactionHash + '" target="_blank">' + transactionHash + '</a>');

                        web3.eth.getBlockNumber(function (error, result) {
                            if (!error) {
                                App._blockNumberAtTimeOfBet = result;
                            }
                            else
                                console.error(error);
                        });

                        App._blockNumberInterval = self.setInterval(App.getRemainingBlocks, 1000);

                        App.showLoading();
                        App.disableRoll();

                        //$(".warning-max-bet").hide();
                        $(".warning-min-bet").hide();
                        $(".warning-max-profit").hide();

                        //updated 100% accurate reward from solidity
                        var _LogBet = App.adoptionInstance.LogBet({PlayerAddress: App.account}, {
                            fromBlock: 'latest',
                            toBlock: 'latest'
                        });
                        _LogBet.watch(function (err, result) {
                            if (err) {
                                console.log(err)
                                return;
                            }
                            var ProfitValue = new BigNumber(web3.fromWei(result.args.ProfitValue, 'ether'));
                            $(".bet-payout").val(ProfitValue);
                            _LogBet.stopWatching();

                        });

                        App._isPlaying = true;

                    }).catch(function(err) {
                        console.log(err.message);
                    });
                // });
            }
            });

          // use our contract to retrieve and mark the adopted pets
          return App.markAdopted();
      });

      return App.bindEvents();
    },

    bindEvents: function() {
      $(document).on('click', '.btn-adopt', App.handleAdopt);
    },

    markAdopted: function(adopters, account) {
        //var adoptionInstance;
        App.contracts.Adoption.deployed().then(function(instance) {
            App.adoptionInstance = instance;
            App.loadData();

            //watch for all result events
            web3.eth.getBlockNumber(function (error, result) {
                //if no error getting blocknumber
                if (!error) {

                    App.currentBlock = result;
                    App.getSinceBlock = App.currentBlock-2500;
                    $('.blockNumber').text(App.getSinceBlock);

                    //watch for all result events
                    var allResultEvents = App.adoptionInstance.LogResult(null, {
                        fromBlock: App.getSinceBlock
                    });

                    allResultEvents.watch(function (err, result) {
                        if (err) {
                            console.log(err)
                            return;
                        }
                        var BetID = result.args.BetID;
                        var PlayerAddress = result.args.PlayerAddress;
                        var DiceResult = parseInt(result.args.DiceResult);
                        var PlayerNumber = parseInt(result.args.PlayerNumber);
                        var Status = parseInt(result.args.Status);
                        var Value = new BigNumber(web3.fromWei(result.args.Value, 'ether'));
                        var text;
                        var symbol;
                        switch (Status) {
                            case 1:
                                text = "Win";
                                symbol = "+";
                                break;
                            case 0:
                                text = "Lose";
                                symbol = "-";
                                break;
                            case 3:
                                text = "Refunded";
                                symbol = "";
                                break;
                            case 4:
                                text = "Refunded send-fail";
                                symbol = "";
                                break;
                            case 2:
                                text = "Win send-fail";
                                symbol = "+";
                                break;
                            default:
                                text = "Unknown";
                                symbol = "";
                        }

                        //stats - all bets
                        $("<tr><th class='desktop-only resultsBetID'>" + BetID + "</th><th>"  + '<a href="https://etherscan.io/address/' + PlayerAddress + '#internaltx" target="_blank">' + PlayerAddress + '</a>' + "</th><th> < " + PlayerNumber + "</th><th>" + DiceResult + "</th><th><span class='result " + text + "'></span></th><th>" + symbol + Value + "</th></tr>").insertAfter('.all > tbody > tr:first');

                        App.loadData();

                    });

                    //watch for result event
                    var resultEvent = App.adoptionInstance.LogResult({PlayerAddress: App.account}, {
                        fromBlock: App.getSinceBlock
                    });

                    resultEvent.watch(function (err, result) {
                        if (err) {
                            console.log(err)
                            return;
                        }
                        var BetID = result.args.BetID;
                        var PlayerAddress = result.args.PlayerAddress;
                        var DiceResult = parseInt(result.args.DiceResult);
                        var PlayerNumber = parseInt(result.args.PlayerNumber);
                        var Status = parseInt(result.args.Status);
                        var Value = new BigNumber(web3.fromWei(result.args.Value, 'ether'));
                        var text;
                        var symbol;
                        switch (Status) {
                            case 1:
                                text = "Win";
                                symbol = "+";
                                break;
                            case 0:
                                text = "Lose";
                                symbol = "-";
                                break;
                            case 3:
                                text = "Refunded";
                                symbol = "";
                                break;
                            case 4:
                                text = "Refunded send-fail";
                                symbol = "";
                                break;
                            case 2:
                                text = "Win send-fail";
                                symbol = "+";
                                break;
                            default:
                                text = "Unknown";
                                symbol = "";
                        }

                        //result UI for player
                        if(App._isPlaying){
                            App.animateUpdate(parseInt(result.args.DiceResult));
                        }
                        $("<tr><th class='desktop-only resultsBetID'>" + BetID + "</th><th>" + '<a href="https://etherscan.io/address/' + PlayerAddress + '#internaltx" target="_blank">' + PlayerAddress + '</a>' + "</th><th> < " + PlayerNumber + "</th><th>" + DiceResult + "</th><th><span class='result " + text + "'></span></th><th>" + symbol + Value + "</th></tr>").insertAfter('.yours > tbody > tr:first');
                        App.loadData();
                    });
                }
                else
                    console.error(error);
            });
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    handleAdopt: function(event) {
        event.preventDefault();

    },
    //this was commented out to allow for asynchronous callbacks to be made in getting accounts info
    //this is now called in callback of getAccounts instead
    //loadData();

    //display purposes only feedback on wait time
    getRemainingBlocks:function () {
        web3.eth.getBlockNumber(function (error, result) {
            if (!error) {
                App.theBlockNumberNow = result;
            }
            else
                console.error(error);
        });
        App._blocksToGo = (App._blockNumberAtTimeOfBet + 3) - App.theBlockNumberNow;
        if (App._blocksToGo > 0) {
            $('#blocks-to-go').val('正在采集 ~' + App._blocksToGo + ' 块...');
        } else {
            $('#blocks-to-go').val('正在接收结果...');
        }
    },

//is player result
    animateUpdate:function (_result) {
        //clears blockNumber checking
        window.clearInterval(App._blockNumberInterval);

        App.hideLoading();
        App.enableRoll();
        App.loadData();
        //get result from event
        $('.die-result').html(_result);

        if (_result == 0) {
            $("#win").hide();
            $("#lose").hide();
            $("#refund").show();
            $('.bet-payout').removeClass('green');
            $('.bet-payout').removeClass('red');
            $('.die-result').removeClass('green');
            $('.die-result').removeClass('green-border');
            $('.die-result').removeClass('red');
            $('.die-result').removeClass('red-border');
            $('html').removeClass('highlight-red');
            return;
        }

        //NEW WIN
        if (_result < App._rollUnder) {
            $("#win").show();
            $("#lose").hide();
            $("#refund").hide();
            $('.bet-payout').removeClass('red');
            $('.bet-payout').addClass('green');
            $('.die-result').removeClass('red');
            $('.die-result').addClass('green');
            $('.die-result').removeClass('red-border');
            $('.die-result').addClass('green-border');
            $('html').addClass('highlight');
        } else {
            $("#win").hide();
            $("#lose").show();
            $("#refund").hide();
            $('.bet-payout').removeClass('green');
            $('.bet-payout').addClass('red');
            $('.die-result').removeClass('green');
            $('.die-result').removeClass('green-border');
            $('.die-result').addClass('red');
            $('.die-result').addClass('red-border');
            $('html').addClass('highlight-red');
        }

        App._isPlaying = false;
    },

    updateBetData:function () {
        $(".bet-amount").val(App._betValue);
        $(".bet-amount-wei").val(web3.toWei(App._betValue, 'ether'));
        $("#bet-number").val($("#slider").slider("value"));
        App.getPayout();
    },

    //BIGNUMBER FOR PAYOUT CALC
    getPayout:function () {
        percentChanceOfWin = $("#slider").slider("value") - 1;
        percentChanceOfLoss = 100 - percentChanceOfWin;
        pCOL = new BigNumber(percentChanceOfLoss);
        pCOW = new BigNumber(percentChanceOfWin);
        x = new BigNumber(pCOL.div(pCOW));
        y = new BigNumber((x.times(App._betValue)).plus(App._betValue));
        xy = new BigNumber(y.times(App._houseEdge).div(1000));
        z = new BigNumber(xy);
        //$(".bet-payout").val(z-_betValue);
        $(".bet-payout").val( z.minus(App._betValue));

        $('#modalPayout').val(z);
        $('#modalAmount').val(App._betValue);
        $('#modalNumber').val($("#slider").slider("value"));
    },

    showLoading:function () {
        $('.generating-wait').show();
        $('.generating-normal').hide();
        $('.place-bet').addClass('red');
        $('.place-bet').removeClass(' green');
    },

    hideLoading:function () {
        $('.generating-normal').show();
        $('.generating-wait').hide();
        $('.place-bet').removeClass('red');
    },

    disableRoll:function () {
        //hide roll button
        $('#place-bet').attr('disabled', 'disabled');
        //disable inputs
        $("#the-bet").attr('disabled', 'disabled');
        $("#seedB").attr('disabled', 'disabled');
        $(".pre-paid").attr('disabled', 'disabled');
        $(".slider-odds").slider({
            disabled: true
        });
        //set bet slip to show locked in
        $('#title-bet-slip').removeClass('red');
        $('#title-bet-slip').addClass('green');
        $('input').addClass('not-allowed');
        $('button').addClass('not-allowed');
        App.updateBalance();
    },

    enableRoll:function () {
        $('#place-bet').show();

        //set bet slip to show locked in
        $('#title-bet-slip').removeClass('red');
        $('#title-bet-slip').removeClass('green');

        //enable inputs
        $("#place-bet").removeAttr('disabled');
        $("#seedB").removeAttr('disabled');
        $(".pre-paid").removeAttr('disabled');
        $("#the-bet").removeAttr('disabled');
        $('input').removeClass('not-allowed');
        $('button').removeClass('not-allowed');
        $(".slider-odds").slider({
            disabled: false
        });
        App.updateBalance();
    },

    loadData:function () {
        //show player address on page
        $('.account').html('<a href="https://etherscan.io/address/' + App.account + '" target="_blank">' + App.account + '</a>');

        //var adoptionInstance;
        //App.contracts.Adoption.deployed().then(function(instance) {
            //adoptionInstance = instance;

            //show player account balance
            App.updateBalance();

            //display max bet
            App.adoptionInstance.maxProfit.call().then(function (result) {
                //if (!error) {
                    App._maxBet = new BigNumber(web3.fromWei(result, 'ether'));
                    $('.max-bet').text(web3.fromWei(result, 'ether'));
                    //$('#max').val(web3.fromWei((result)), 'ether');
                //}
                //else
                //    console.error(error);
            });

            //display max profit
            //display min bet
            App.adoptionInstance.minBet.call().then(function (result) {
                // if (!error) {
                    App._minBet = new BigNumber(web3.fromWei(result, 'ether'));
                    $('.min-bet').text(web3.fromWei(result, 'ether'));
                    $('#min').val(web3.fromWei((result)), 'ether');
                // }
                // else
                //     console.error(error);
            });

            // App.adoptionInstance.playerGetPendingTxByAddress.call(App.account).then(function (result) {
            //     //if (!error) {
            //         $('.withdrawAvailable').text(web3.fromWei(result, 'ether') + ' ETH');
            //     // }
            //     // else
            //     //     console.error(error);
            // });

            App.showBannerData();
        //});

    },

//show banner data
    showBannerData:function () {

        //var adoptionInstance;
        //App.contracts.Adoption.deployed().then(function(instance) {
        //    adoptionInstance = instance;
            //display totalWeiWagered
            App.adoptionInstance.totalWeiWagered.call().then(function (result) {
                // if (!error) {
                    $('.die-result-total-wei-wagered').text(web3.fromWei(result, 'ether'));
                // }
                // else
                //     console.error(error);
            });

            //display totalWeiWon
            App.adoptionInstance.totalWeiWon.call().then(function (result) {
                // if (!error) {
                    $('.die-result-total-wei-won').text(web3.fromWei(result, 'ether'));
                // }
                // else
                //     console.error(error);
            });

            //display totalBets
            App.adoptionInstance.totalBets.call().then(function (result) {
                // if (!error) {
                    $('.die-result-total-bets').text(result);
                // }
                // else
                //     console.error(error);
            });
        //});
    },

    updateBalance:function () {
        $('.balance').text(web3.eth.getBalance(App.account, undefined, function (error, result) {
            if (!error) {
                var bal = new BigNumber(web3.fromWei(result, 'ether'));
                $('.balance').text(bal);
            }
            else
                console.error(error);
        }));
    }

  };

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
