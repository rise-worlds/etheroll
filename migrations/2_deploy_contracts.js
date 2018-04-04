var Etheroll = artifacts.require("Etheroll");
// var usingOraclize = artifacts.require("usingOraclize");
// var DSSafeAddSub = artifacts.require("DSSafeAddSub");
var strings = artifacts.require("strings");
// var SmartBillions = artifacts.require("SmartBillions");

module.exports = function(deployer) {
  deployer.deploy(strings);
  // deployer.deploy(usingOraclize);
  // deployer.deploy(DSSafeAddSub);
  // deployer.link(usingOraclize, Etheroll);
  // deployer.link(DSSafeAddSub, Etheroll);
  deployer.link(strings, Etheroll);
  deployer.deploy(Etheroll);
  // deployer.deploy(SmartBillions);
};