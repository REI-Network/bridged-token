// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BridgedERC20.sol";

contract BridgedERC20Factory is Ownable {
    uint256 public creationPayment;
    address public admin;

    event CreationPaymentUpdated(uint256 previousPayment);
    event AdminUpdated(address previousAdminRole);
    event CreateERC20(address indexed creater, address indexed token, string name, string symbol, uint8 decimals);

    function setCreationPayment(uint256 _payment) public onlyOwner {
        creationPayment = _payment;
        emit CreationPaymentUpdated(_payment);
    }

    function setAdmin(address _admin) public onlyOwner {
        admin = _admin;
        emit AdminUpdated(_admin);
    }

    function create(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) public payable {
        require(msg.value >= creationPayment, "BridgedERC20: must pay for creation more than creationPayment");
        BridgedERC20 erc20 = new BridgedERC20(name, symbol, decimals_, admin);
        emit CreateERC20(msg.sender, address(erc20), name, symbol, decimals_);
    }

    function withdrawAll(address payable to) public onlyOwner {
        to.transfer(address(this).balance);
    }
}
