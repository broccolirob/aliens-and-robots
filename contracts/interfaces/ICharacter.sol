// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol';

interface ICharacter is IERC721Metadata, IERC721Enumerable {
  enum Status {
    PendingVRF,
    Unnamed,
    PendingName,
    Active
  }

  enum Type {
    None,
    Alien,
    Robot
  }

  struct Character {
    string name;
    uint256 randomNumber;
    address owner;
    Type race;
    Status status;
    uint8 subtype;
    uint8 strength;
    uint8 dexterity;
    uint8 constitution;
    uint8 intelligence;
    uint8 wisdom;
    uint8 charisma;
  }

  function safeMint(address to) external returns (uint256);

  function setRandomness(uint256 tokenId, uint256 randomness) external;
}
