pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Etheroll.sol";

contract TestAdoption {
  Etheroll adoption = Etheroll(DeployedAddresses.Etheroll());

  function testUserRollDice() public {
    adoption.playerRollDice(8);
  }

  // function testGetAdopterAddressByPetId() public {
  //   address expected = this;
  //   address adopter = adoption.adopters(8);
  //   Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded.");
  // }

  // function testGetAdopterAddressByPetIdInArray() public {
  //   address expected = this;
  //   address[16] memory adopters = adoption.getAdopters();
  //   Assert.equal(adopters[8], expected, "Owner of pet ID 8 should be recorded.");
  // }
}
