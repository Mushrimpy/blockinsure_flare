pragma solidity ^0.8.19;
import "hardhat/console.sol";

struct CityData {
    string name;
    uint256 rainfall;
}

/*
Key Notes:
- Hardcoded 7 days settlement window
- Preferable short maturity length (10-20 seconds) to immediately see result
- Hardcoded purchase deadline for a day after maturity (NOT REALISTIC), but helpful so we are not pressed for time.

*/

// Interface for the GetWeatherData Contract
interface IWeatherOracle {
    function getAllCityData() external view returns (CityData[] memory);
}

contract WeatherInsuranceMarketplace {
    // A struct that contains all the state for each insurance policy
    struct Policy {
        address insurer; // Original creator/seller of the policy
        address policyholder; // Current owner of the policy
        uint256 maturitySecond; // When the policy matures
        uint256 purchaseDeadline; // Deadline to purchase the policy
        bool isFinalized; // Whether policy has been purchased
        bool isPaidOut; // Whether policy has been settled
        uint256 coverage; // Payout amount if conditions are met
        uint256 premium; // Cost to purchase the policy
        uint256 cityNum; // cityNum for weather data
        uint256 threshold; // Weather threshold for payout
        uint256 deposit; // Amount deposited by insurer (moved from separate mapping)
    }

    // State variables
    uint256 private nextPolicyId = 1;
    mapping(uint256 => Policy) public policies;

    // Constant values
    uint256 public constant SETTLEMENT_WINDOW = 1 days;

    address public constant OTHER_CONTRACT = 0x335BCfba4aB4f3B9E052f13525D8017DB574b7C9;
    IWeatherOracle RAINFALL_ORACLE = IWeatherOracle(OTHER_CONTRACT);

    // Events for logging contract activity
    event PolicyCreated(uint256 indexed policyId, address insurer, uint256 coverage, uint256 premium);
    event PolicyPurchased(uint256 indexed policyId, address policyholder);
    event PolicySettled(uint256 indexed policyId, address recipient, uint256 amount);
    event PolicyReturnCheck(uint256 indexed policyId, address recipient, uint256 amount, uint256 rainfall);
    event PolicyClientCheck(uint256 indexed policyId, address recipient, uint256 amount, uint256 rainfall);
    event PolicyCancelled(uint256 indexed policyId);

    /**
     * @notice Creates a new policy with specified parameters
     * @dev Insurer must deposit full coverage amount
     */
    function createPolicy(
        uint256 _maturitySecond,
        uint256 _coverage,
        uint256 _premium,
        uint256 _cityNum,
        uint256 _threshold
    ) external payable returns (uint256) {
        require(msg.value >= _coverage, "Must deposit full coverage");

        uint256 policyId = nextPolicyId++;

        Policy storage policy = policies[policyId];
        policy.insurer = msg.sender;
        policy.maturitySecond = block.timestamp + _maturitySecond;
        policy.purchaseDeadline = policy.maturitySecond + 1 days;
        policy.coverage = _coverage;
        policy.premium = _premium;
        policy.cityNum = _cityNum;
        policy.threshold = _threshold;
        policy.deposit = msg.value; // Track deposit directly in the struct

        emit PolicyCreated(policyId, msg.sender, _coverage, _premium);

        return policyId;
    }

    /**
     * @notice Allows purchase of a policy by paying the premium
     * @dev Premium goes directly to the insurer
     */
    function purchasePolicy(uint256 _policyId) external payable {
        Policy storage policy = policies[_policyId];

        require(!policy.isFinalized, "Already finalized");
        require(policy.policyholder == address(0), "Policy already purchased");
        require(msg.value == policy.premium, "Must pay exact premium");
        require(block.timestamp < policy.purchaseDeadline, "Contract expired");

        policy.policyholder = msg.sender;

        // Transfer premium to insurer
        (bool sent, ) = payable(policy.insurer).call{ value: policy.premium }("");
        require(sent, "Failed to send premium");

        policy.isFinalized = true;
        emit PolicyPurchased(_policyId, msg.sender);
    }

    /**
     * @notice Settles a specific policy using oracle data
     * @dev Uses the weather oracle to determine payout recipient
     */
    function settle(uint256 _policyId) external {
        Policy storage policy = policies[_policyId];
        require(block.timestamp >= policy.maturitySecond, "Not mature yet");
        require(!policy.isPaidOut, "Already paid out");
        require(policy.isFinalized, "Contract not finalized");
        require(policy.deposit > 0, "No deposit to pay out");

        // Check if past settlement window
        if (block.timestamp > policy.maturitySecond + SETTLEMENT_WINDOW) {
            // Past window, return funds to insurer
            require(policy.insurer != address(0), "Invalid insurer");
            (bool insurerSent, ) = payable(policy.insurer).call{ value: policy.deposit }("");
            if (!insurerSent) {
                revert("Failed to send payment");
            }
            policy.isPaidOut = true; // Set after successful payment
            emit PolicySettled(_policyId, policy.insurer, policy.deposit);
            return;
        }

        console.log("Fetching data from rainfall portal");
        // Get rainfall data from oracle
        CityData[] memory cityDataArray = RAINFALL_ORACLE.getAllCityData();
        require(policy.cityNum < cityDataArray.length, "Invalid city number");

        console.log("cityArray length:", cityDataArray.length);
        for (uint i = 0; i < cityDataArray.length; i++) {
            console.log("City", i, ":");
            console.log("Rainfall:", cityDataArray[i].rainfall);
        }

        uint256 rainfall = cityDataArray[policy.cityNum].rainfall;
        console.log("Rainfall data:");
        console.log(rainfall);

        // Determine recipient based on rainfall
        address payable recipient;
        if (rainfall < policy.threshold) {
            recipient = payable(policy.policyholder);
            emit PolicyClientCheck(_policyId, recipient, policy.deposit, rainfall);
        } else {
            recipient = payable(policy.insurer);
            emit PolicyReturnCheck(_policyId, recipient, policy.deposit, rainfall);
        }
        require(recipient != address(0), "Invalid recipient");

        console.log("sendingPayment");
        // Send payment using the deposited amount
        (bool recipientSent, ) = recipient.call{ value: policy.deposit }("");
        if (!recipientSent) {
            revert("Failed to send payment");
        }

        policy.isPaidOut = true; // Set after successful payment
        emit PolicySettled(_policyId, recipient, policy.deposit);
    }

    /**
     * @notice Allows insurer to cancel an unsold policy
     * @dev Returns deposited coverage amount
     */
    function cancelPolicy(uint256 _policyId) external {
        Policy storage policy = policies[_policyId];
        require(msg.sender == policy.insurer, "Not insurer");
        require(!policy.isFinalized, "Already purchased");

        uint256 depositAmount = policy.deposit;
        policy.deposit = 0; // Clear deposit before sending

        (bool sent, ) = policy.insurer.call{ value: depositAmount }("");
        require(sent, "Failed to return deposit");

        emit PolicyCancelled(_policyId);
    }

    /**
     * @notice Gets all active policies
     */
    function getAllPolicies() external view returns (Policy[] memory) {
        uint256 count = 0;
        // First pass: count valid policies
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].insurer != address(0)) {
                count++;
            }
        }

        // Second pass: create array of valid policies
        Policy[] memory allPolicies = new Policy[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].insurer != address(0)) {
                allPolicies[index] = policies[i];
                index++;
            }
        }
        return allPolicies;
    }

    /**
     * @notice Gets the full status of a policy
     */
    function getPolicyStatus(
        uint256 _policyId
    )
        external
        view
        returns (
            address _insurer,
            address _policyholder,
            bool _isFinalized,
            bool _isPaidOut,
            uint256 _coverage,
            uint256 _premium,
            uint256 _maturitySecond,
            uint256 _purchaseDeadline,
            uint256 _deposit
        )
    {
        Policy storage policy = policies[_policyId];
        return (
            policy.insurer,
            policy.policyholder,
            policy.isFinalized,
            policy.isPaidOut,
            policy.coverage,
            policy.premium,
            policy.maturitySecond,
            policy.purchaseDeadline,
            policy.deposit
        );
    }
}
// //SPDX-License-Identifier: MIT
// pragma solidity >=0.8.0 <0.9.0;

// // Useful for debugging. Remove when deploying to a live network.
// import "hardhat/console.sol";

// // Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// // import "@openzeppelin/contracts/access/Ownable.sol";

// /**
//  * A smart contract that allows changing a state variable of the contract and tracking the changes
//  * It also allows the owner to withdraw the Ether in the contract
//  * @author BuidlGuidl
//  */
// contract YourContract {
//     // State Variables
//     address public immutable owner;
//     string public greeting = "Building Unstoppable Apps!!!";
//     bool public premium = false;
//     uint256 public totalCounter = 0;
//     mapping(address => uint) public userGreetingCounter;

//     // Events: a way to emit log statements from smart contract that can be listened to by external parties
//     event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

//     // Constructor: Called once on contract deployment
//     // Check packages/hardhat/deploy/00_deploy_your_contract.ts
//     constructor(address _owner) {
//         owner = _owner;
//     }

//     // Modifier: used to define a set of rules that must be met before or after a function is executed
//     // Check the withdraw() function
//     modifier isOwner() {
//         // msg.sender: predefined variable that represents address of the account that called the current function
//         require(msg.sender == owner, "Not the Owner");
//         _;
//     }

//     /**
//      * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
//      *
//      * @param _newGreeting (string memory) - new greeting to save on the contract
//      */
//     function setGreeting(string memory _newGreeting) public payable {
//         // Print data to the hardhat chain console. Remove when deploying to a live network.
//         console.log("Setting new greeting '%s' from %s", _newGreeting, msg.sender);

//         // Change state variables
//         greeting = _newGreeting;
//         totalCounter += 1;
//         userGreetingCounter[msg.sender] += 1;

//         // msg.value: built-in global variable that represents the amount of ether sent with the transaction
//         if (msg.value > 0) {
//             premium = true;
//         } else {
//             premium = false;
//         }

//         // emit: keyword used to trigger an event
//         emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
//     }

//     /**
//      * Function that allows the owner to withdraw all the Ether in the contract
//      * The function can only be called by the owner of the contract as defined by the isOwner modifier
//      */
//     function withdraw() public isOwner {
//         (bool success, ) = owner.call{ value: address(this).balance }("");
//         require(success, "Failed to send Ether");
//     }

//     /**
//      * Function that allows the contract to receive ETH
//      */
//     receive() external payable {}
// }
