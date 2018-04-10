var Etheroll = artifacts.require("./Etheroll.sol");
//var oraclizeLib = artifacts.require("./oraclizeLib.sol");

module.exports = function(deployer) {
  //deployer.deploy(oraclizeLib);
  //deployer.link(oraclizeLib,Etheroll);
  deployer.deploy(Etheroll);
};
