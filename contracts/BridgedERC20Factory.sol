// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BridgedERC20.sol";

contract BridgedERC20Factory is Ownable {
    uint256 public creationPayment;
    address public adminRole;

    event CreationPaymentUpdated(uint256 previousPayment);
    event AdminRoleUpdated(address previousAdminRole);
    event CreateERC20(address indexed creater, address indexed token, string name, string symbol, uint8 decimals);

    function setCreationPayment(uint256 _payment) public onlyOwner {
        creationPayment = _payment;
        CreationPaymentUpdated(_payment);
    }

    function setAdminRole(address _adminRole) public onlyOwner {
        adminRole = _adminRole;
        AdminRoleUpdated(_adminRole);
    }

    function create(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) public payable {
        require(msg.value >= 0, "BridgedERC20: must pay for creation");
        BridgedERC20 erc20 = new BridgedERC20(name, symbol, decimals_, adminRole);
        CreateERC20(msg.sender, address(erc20), name, symbol, decimals_);
    }

    receive() external payable {}
}
