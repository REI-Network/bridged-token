import type Web3 from 'web3';
import type { Artifacts } from 'hardhat/types';
import { assert, expect } from 'chai';

declare const artifacts: Artifacts;
declare const web3: Web3;

const BridgedERC20 = artifacts.require('BridgedERC20');

describe('BridgedERC20', () => {
  let token: any;
  let deployer: string;
  let bridge1: string;
  let bridge2: string;
  let user: string;
  let MINTER_ROLE: string;
  let PAUSER_ROLE: string;
  let DEFAULT_ADMIN_ROLE: string;

  before(async () => {
    const accounts = await web3.eth.getAccounts();
    deployer = accounts[0];
    bridge1 = accounts[1];
    bridge2 = accounts[2];
    user = accounts[3];
  });

  it('should deploy succeed', async () => {
    token = new web3.eth.Contract(BridgedERC20.abi, (await BridgedERC20.new('BridgedERC20', 'BERC20', 18)).address, { from: deployer });

    MINTER_ROLE = await token.methods.MINTER_ROLE().call();
    PAUSER_ROLE = await token.methods.PAUSER_ROLE().call();
    DEFAULT_ADMIN_ROLE = await token.methods.DEFAULT_ADMIN_ROLE().call();

    expect(await token.methods.name().call()).to.equal('BridgedERC20');
    expect(await token.methods.symbol().call()).to.equal('BERC20');
    expect(await token.methods.decimals().call()).to.equal('18');
  });

  it('should have admin and pauser role', async () => {
    expect(await token.methods.hasRole(DEFAULT_ADMIN_ROLE, deployer).call()).be.true;
    expect(await token.methods.hasRole(PAUSER_ROLE, deployer).call()).be.true;
  });

  it('should mint fail before grant role', async () => {
    let succeed = false;
    try {
      await token.methods.mint(user, 10).send({ from: bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail before grant role');
    }
  });

  it('should grant role succeed', async () => {
    await token.methods.grantRole(MINTER_ROLE, bridge1).send();
    await token.methods.grantRole(MINTER_ROLE, bridge2).send();
    expect(await token.methods.hasRole(MINTER_ROLE, bridge1).call()).be.true;
    expect(await token.methods.hasRole(MINTER_ROLE, bridge2).call()).be.true;
  });

  it('should mint fail before set cap', async () => {
    let succeed = false;
    try {
      await token.methods.mint(user, 10).send({ from: bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail before set cap');
    }
  });

  it('should set cap succeed', async () => {
    await token.methods.setMinterCap(bridge1, 100).send();
    await token.methods.setMinterCap(bridge2, 100).send();
    expect((await token.methods.minterSupply(bridge1).call()).cap).be.equal('100');
    expect((await token.methods.minterSupply(bridge2).call()).cap).be.equal('100');
  });

  it('should mint succeed(1)', async () => {
    await token.methods.mint(user, 10).send({ from: bridge1 });
    await token.methods.mint(user, 10).send({ from: bridge2 });
    const b1 = await token.methods.minterSupply(bridge1).call();
    const b2 = await token.methods.minterSupply(bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('10');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('10');
    expect(await token.methods.balanceOf(user).call()).be.equal('20');
  });

  it('should burn succeed', async () => {
    await token.methods.burn(1).send({ from: user });
    expect(await token.methods.balanceOf(user).call()).be.equal('19');
  });

  it('should burnFrom fail', async () => {
    let succeed = false;
    try {
      await token.methods.burnFrom(user, 1).send({ from: bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should burnFrom fail');
    }
  });

  it('should approve succeed', async () => {
    await token.methods.approve(bridge1, 100).send({ from: user });
    await token.methods.approve(bridge2, 100).send({ from: user });
    expect(await token.methods.allowance(user, bridge1).call()).be.equal('100');
    expect(await token.methods.allowance(user, bridge2).call()).be.equal('100');
  });

  it('should burnFrom succeed(1)', async () => {
    await token.methods.burnFrom(user, 5).send({ from: bridge1 });
    await token.methods.burnFrom(user, 5).send({ from: bridge2 });
    const b1 = await token.methods.minterSupply(bridge1).call();
    const b2 = await token.methods.minterSupply(bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('5');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('5');
    expect(await token.methods.balanceOf(user).call()).be.equal('9');
  });

  it('should mint succeed(2)', async () => {
    await token.methods.mint(user, 95).send({ from: bridge1 });
    await token.methods.mint(user, 95).send({ from: bridge2 });
    const b1 = await token.methods.minterSupply(bridge1).call();
    const b2 = await token.methods.minterSupply(bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('100');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('100');
    expect(await token.methods.balanceOf(user).call()).be.equal(`${9 + 95 + 95}`);
  });

  it('should burnFrom succeed(2)', async () => {
    await token.methods.burnFrom(user, 5).send({ from: bridge1 });
    await token.methods.burnFrom(user, 5).send({ from: bridge2 });
    const b1 = await token.methods.minterSupply(bridge1).call();
    const b2 = await token.methods.minterSupply(bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('95');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('95');
    expect(await token.methods.balanceOf(user).call()).be.equal(`${9 + 95 + 95 - 10}`);
  });

  it('should mint fail when too many token minted', async () => {
    let succeed = false;
    try {
      await token.methods.mint(user, 100).send({ from: bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail when too many token minted');
    }
  });

  it('should revoke role succeed', async () => {
    await token.methods.revokeRole(MINTER_ROLE, bridge1).send();
    await token.methods.revokeRole(MINTER_ROLE, bridge2).send();
    expect(await token.methods.hasRole(MINTER_ROLE, bridge1).call()).be.false;
    expect(await token.methods.hasRole(MINTER_ROLE, bridge2).call()).be.false;
  });

  it('should mint fail after revoke role', async () => {
    let succeed = false;
    try {
      await token.methods.mint(user, 1).send({ from: bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail after revoke role');
    }
  });
});
