// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@chainlink/contracts/src/v0.7/Operator.sol';

contract OracleWrapper is Operator {
  constructor(address _link) Operator(_link, msg.sender) {}
}
