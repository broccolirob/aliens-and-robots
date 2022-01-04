// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "./library/Base64.sol";

contract CharacterNFT is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Strings for uint256;

    enum Status {
        PendingVRF,
        Unnamed,
        PendingName,
        Active
    }

    enum Type {
        Alien,
        Robot
    }

    struct Character {
        string name;
        uint256 dna;
        uint256 createdAt;
        address owner;
        Type race;
        Status status;
        uint8 subtype;
        uint8 strength;
        uint8 speed;
        uint8 stamina;
    }

    CountersUpgradeable.Counter private _tokenIdCounter;
    mapping(Type => string[]) private _images;
    mapping(uint256 => Character) private _characters;
    mapping(string => bool) private _characterNamesUsed;

    event SetCharacterName(
        uint256 indexed _tokenId,
        string _oldName,
        string _newName
    );

    constructor() initializer {}

    function initialize(string[] memory _aliens, string[] memory _robots)
        public
        initializer
    {
        // __ERC721_init('Aliens & Robots', 'AnR');
        __ERC721_init("Testing NFT", "TST");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _images[Type.Alien] = _aliens;
        _images[Type.Robot] = _robots;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function characterNameAvailable(string calldata _name)
        external
        view
        returns (bool available_)
    {
        available_ = !_characterNamesUsed[_validateAndLowerName(_name)];
    }

    function setCharacterName(uint256 _tokenId, string calldata _name)
        external
        onlyRole(MINTER_ROLE)
    {
        require(_msgSender() == ownerOf(_tokenId), "ERC721: only token owner");
        require(
            _characters[_tokenId].status == Status.Unnamed,
            "ERC721: must be unnamed"
        );
        string memory lowerName = _validateAndLowerName(_name);
        string memory existingName = _characters[_tokenId].name;
        if (bytes(existingName).length > 0) {
            delete _characterNamesUsed[_validateAndLowerName(existingName)];
        }
        require(!_characterNamesUsed[lowerName], "ERC721: name used already");
        _characterNamesUsed[lowerName] = true;
        _characters[_tokenId].name = _name;
        emit SetCharacterName(_tokenId, existingName, _name);
    }

    function safeMint(address to)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        Character memory character;
        character.owner = to;
        character.createdAt = block.timestamp;
        _characters[tokenId] = character;
        _safeMint(to, tokenId);
    }

    function setRandomness(uint256 tokenId, uint256 randomness)
        external
        onlyRole(MINTER_ROLE)
    {
        require(_exists(tokenId), "ERC721: tokenId does not exist");
        require(randomness > 0, "ERC721: abnormal randomness");

        uint256[3] memory attributes;
        for (uint256 i = 0; i < 3; i++) {
            attributes[i] = uint256(keccak256(abi.encode(randomness, i)));
        }

        Character storage character = _characters[tokenId];
        character.status = Status.Unnamed;
        character.dna = randomness;
        character.race = randomness % 2 == 0 ? Type.Alien : Type.Robot;
        character.subtype = uint8(randomness % _images[character.race].length);
        character.strength = uint8((attributes[0] % 100) + 1);
        character.speed = uint8((attributes[1] % 100) + 1);
        character.stamina = uint8((attributes[2] % 100) + 1);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory output)
    {
        require(_exists(tokenId), "ERC721: tokenId does not exist");

        Character memory character = _characters[tokenId];
        // require(character.status == Status.Active, 'ERC721: token not active');

        string memory imageUrl = string(
            abi.encodePacked(
                _baseURI(),
                _images[character.race][character.subtype]
            )
        );
        string memory characterType = character.race == Type.Alien
            ? "Alien"
            : "Robot";
        output = string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        string(
                            abi.encodePacked(
                                '{"name": "Test", "description": "Alien and Robot NFT characters", "background_color": "A9F4DE", "image": "',
                                imageUrl,
                                '", "attributes" : [{"trait_type": "Strength", "max_value": 100, "value": ',
                                uint256(character.strength).toString(),
                                '}, {"trait_type": "Speed", "max_value": 100, "value": ',
                                uint256(character.speed).toString(),
                                '}, {"trait_type": "Stamina", "max_value": 100, "value": ',
                                uint256(character.stamina).toString(),
                                '}, {"trait_type": "Type", "value": "',
                                characterType,
                                '"}]}'
                            )
                        )
                    )
                )
            )
        );
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            AccessControlUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _validateAndLowerName(string memory _name)
        internal
        pure
        returns (string memory)
    {
        bytes memory name = abi.encodePacked(_name);
        uint256 len = name.length;
        require(len != 0, "ERC721: name is empty");
        require(len < 26, "ERC721: name too long");
        uint256 char = uint256(uint8(name[0]));
        require(char != 32, "ERC721: no padding - start");
        char = uint256(uint8(name[len - 1]));
        require(char != 32, "ERC721: no padding - end");
        for (uint256 i; i < len; i++) {
            char = uint256(uint8(name[i]));
            require(char > 31 && char < 127, "ERC721: invalid character");
            if (char < 91 && char > 64) {
                name[i] = bytes1(uint8(char + 32));
            }
        }
        return string(name);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/";
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    )
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }
}
