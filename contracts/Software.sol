pragma solidity ^0.5.0;

contract Software {
    // Model the software licence offerings
    struct Licence {
        uint id;
        string userID; // added for tracking the UserID
        string option;
        uint licenceCount;
    }

    // Store accounts that have used options
    mapping(address => bool) public users;

    // Store Options
    
    // Fetch Option
    mapping(uint => Licence) public licences;

    // Store Licence Count
    uint public licenceCount;

    // Store Licence Count
    string public userID; // added for tracking the UserID

    // use event
    event useEvent(uint indexed _licenceId);

    constructor () public {
        addLicence("Read-Only Access (FREE)");
        addLicence("Read-WRITE One-Time Access");
        addLicence("Read-WRITE Unlimited Subscription");
    }

    function addLicence (string memory _name) private {
        licenceCount ++;
        licences[licenceCount] = Licence(licenceCount, userID, _name, 0);
    }

    function use (uint _licenceId) public {
        // require that they haven't used before
        require(!users[msg.sender]);

        // require a valid licence
        require(_licenceId > 0 && _licenceId <= licenceCount);

        // record that user has used the licence
        users[msg.sender] = true;

        // update licence use Count
        licences[_licenceId].licenceCount ++;

        // trigger use event
        emit useEvent(_licenceId);
    }

    function test() 
        public
        view     
        returns (string memory) 
    {

        uint256 randomNumber;
        // uint randomNumber = uint(keccak256(abi.encodePacked(_addr))) % MAX_INT;
        return addressToString();
    }

    function addressToString() public pure returns(string memory) 
    {       
        uint256 MIN_INT  = - 1**256;
        uint256 MAX_INT = 2**256 - 1;
        uint randomNumber = uint(keccak256(abi.encodePacked(MIN_INT))) % MAX_INT;


        bytes32 value = bytes32(uint256(randomNumber));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(51);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

}