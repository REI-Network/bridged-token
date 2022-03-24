// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract BridgedERC20 is
    Context,
    ERC20,
    ERC20Pausable,
    AccessControlEnumerable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Supply {
        uint256 cap;
        uint256 total;
    }

    mapping(address => Supply) public minterSupply;

    event MinterCapUpdated(address bridge, uint256 supplyCap);

    uint8 private immutable _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public virtual {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "BridgedERC20: must have minter role to mint"
        );
        Supply storage s = minterSupply[_msgSender()];
        s.total += amount;
        require(s.total <= s.cap, "BridgedERC20: minter cap exceeded");
        _mint(to, amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Minter destroys `amount` tokens from the account.
     */
    function burnFrom(address account, uint256 amount) public virtual {
        Supply storage s = minterSupply[_msgSender()];
        require(s.cap > 0, "BridgedERC20: invalid caller");
        require(
            s.total > amount,
            "BridgedERC20: burn amount exceeds minter total supply"
        );
        unchecked {
            s.total -= amount;
        }
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    /**
     * @dev Just the same as burn from
     */
    function burn(address account, uint256 amount) public virtual {
        burnFrom(account, amount);
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC20Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "BridgedERC20: must have pauser role to pause"
        );
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC20Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "BridgedERC20: must have pauser role to unpause"
        );
        _unpause();
    }

    function getMinterSupply(address minter)
        external
        view
        returns (Supply memory)
    {
        return minterSupply[minter];
    }

    function setMinterCap(address minter, uint256 cap)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(MINTER_ROLE, minter);
        minterSupply[minter].cap = cap;
        emit MinterCapUpdated(minter, cap);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
