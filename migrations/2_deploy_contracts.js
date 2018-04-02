var Adoption = artifacts.require("Adoption");
var usingOraclize = artifacts.require("usingOraclize");
var DSSafeAddSub = artifacts.require("DSSafeAddSub");
var strings = artifacts.require("strings");

module.exports = function(deployer) {
  deployer.deploy(strings);
  deployer.deploy(usingOraclize);
  deployer.deploy(DSSafeAddSub);
  deployer.link(usingOraclize, Adoption);
  deployer.link(DSSafeAddSub, Adoption);
  //deployer.link(strings, Adoption);
  deployer.deploy(Adoption);

  // deployer.deploy(usingOraclize, {overwrite: false}).then(function() {
  //   deployer.deploy(DSSafeAddSub, {overwrite: false}).then(function() {
  //     deployer.deploy(strings, {overwrite: false}).then(function() {
  //       return deployer.deploy(Etheroll, [usingOraclize.address, DSSafeAddSub.address]);
  //     });
  //   });
  // });
};