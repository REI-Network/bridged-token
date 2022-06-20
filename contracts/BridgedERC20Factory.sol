// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BridgedERC20.sol";

contract BridgedERC20Factory is Ownable {
    uint256 public creationPayment;
    address public admin;

    event CreationPaymentUpdated(uint256 previousPayment, uint256 newPayment);
    event AdminUpdated(address previousAdmin, address newAdmin);
    event CreateERC20(address indexed creator, address indexed token, string name, string symbol, uint8 decimals, address admin);

    function setCreationPayment(uint256 _payment) public onlyOwner {
        uint256 previousPayment = creationPayment;
        creationPayment = _payment;
        emit CreationPaymentUpdated(previousPayment, _payment);
    }

    function setAdmin(address _admin) public onlyOwner {
        address previousAdmin = admin;
        admin = _admin;
        emit AdminUpdated(previousAdmin, _admin);
    }

    function create(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) public payable {
        require(msg.value >= creationPayment, "BridgedERC20: must pay for creation more than creationPayment");
        BridgedERC20 erc20 = new BridgedERC20(name, symbol, decimals_, admin);
        emit CreateERC20(msg.sender, address(erc20), name, symbol, decimals_, admin);
    }

    function withdrawAll(address payable to) public onlyOwner {
        to.transfer(address(this).balance);
    }
}
