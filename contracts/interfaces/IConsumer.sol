// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IConsumer {
  function validateName(string memory _name) external returns (bytes32);

  function setRegistry(address _registry) external;
}
