// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import {LinkTokenInterface} from '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {AccessControlUpgradeable} from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import {ReentrancyGuardUpgradeable} from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import {ICharacter} from './interfaces/ICharacter.sol';

contract Controller is
  Initializable,
  ReentrancyGuardUpgradeable,
  AccessControlUpgradeable,
  ChainlinkClient
{
  using Chainlink for Chainlink.Request;

  address public vrf;
  address public oracle;
  bytes32 public keyHash;
  bytes32 public jobId;
  uint256 public vrfFee;
  uint256 public oracleFee;
  uint256 public mintPrice;

  ICharacter public characterNFT;

  mapping(bytes32 => uint256) private nonces;
  mapping(bytes32 => uint256) private requestIdToTokenId;
  mapping(bytes32 => string) private requestIdToName;
  mapping(string => bool) public validName;

  constructor() initializer {}

  function initialize(
    address _vrf,
    address _oracle,
    bytes32 _keyHash,
    bytes32 _jobId,
    uint256 _vrfFee,
    uint256 _oracleFee,
    ICharacter _characterNFT
  ) public initializer {
    setPublicChainlinkToken();

    vrf = _vrf;
    keyHash = _keyHash;
    vrfFee = _vrfFee;

    oracle = _oracle;
    jobId = _jobId;
    oracleFee = _oracleFee;

    characterNFT = _characterNFT;
    mintPrice = 0.001 ether;

    __AccessControl_init();
    __ReentrancyGuard_init();
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function updateJobId(bytes32 _jobId) external onlyRole(DEFAULT_ADMIN_ROLE) {
    jobId = _jobId;
  }

  function validateName(string calldata _name)
    external
    returns (bytes32 requestId)
  {
    Chainlink.Request memory request = buildChainlinkRequest(
      jobId,
      address(this),
      this.fulfill.selector
    );
    request.add('name', _name);
    requestId = sendChainlinkRequestTo(oracle, request, oracleFee);
    requestIdToName[requestId] = _name;
  }

  function fulfill(bytes32 requestId, bool value)
    public
    recordChainlinkFulfillment(requestId)
  {
    string memory name = requestIdToName[requestId];
    validName[name] = value;
  }

  function createCharacter() external payable nonReentrant {
    require(msg.value >= mintPrice, 'Insufficient ether sent');
    require(tx.origin == msg.sender, 'EOA only');
    bytes32 requestId = requestRandomness();
    uint256 tokenId = characterNFT.safeMint(msg.sender);
    requestIdToTokenId[requestId] = tokenId;
  }

  function requestRandomness() internal returns (bytes32 requestId) {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.balanceOf(address(this)) >= vrfFee, 'Not enough Link to call');

    link.transferAndCall(vrf, vrfFee, abi.encode(keyHash, 0));
    uint256 vrfSeed = uint256(
      keccak256(abi.encode(keyHash, 0, address(this), nonces[keyHash]))
    );
    nonces[keyHash]++;

    return keccak256(abi.encodePacked(keyHash, vrfSeed));
  }

  function rawFulfillRandomness(bytes32 requestId, uint256 randomness)
    external
  {
    require(msg.sender == vrf, 'Only vrf can fulfill randomness requests');
    uint256 tokenId = requestIdToTokenId[requestId];
    characterNFT.setRandomness(tokenId, randomness);
  }

  function withdrawLink() external onlyRole(DEFAULT_ADMIN_ROLE) {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(
      link.transfer(msg.sender, link.balanceOf(address(this))),
      'Link transfer failed'
    );
  }

  function withdrawEther() external onlyRole(DEFAULT_ADMIN_ROLE) {
    payable(msg.sender).transfer(address(this).balance);
  }
}
