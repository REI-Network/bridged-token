import type Web3 from 'web3';
import type { Artifacts } from 'hardhat/types';
import { assert, expect } from 'chai';

declare const artifacts: Artifacts;
declare const web3: Web3;

const BridgedERC20Factory = artifacts.require('BridgedERC20Factory');
const BridgedERC20 = artifacts.require('BridgedERC20');

describe('BridgedERC20Factory', function () {
  before(async function () {
    const accounts = await web3.eth.getAccounts();
    this.deployer = accounts[0];
    this.admin = accounts[1];
    this.payment = web3.utils.toWei('10', 'ether');
    this.bridge1 = accounts[2];
    this.bridge2 = accounts[3];
    this.user = accounts[4];
    this.to = '0x0000000000000000000000000000000000000000';
  });

  it('should deploy succeed', async function () {
    this.factory = new web3.eth.Contract(BridgedERC20Factory.abi, (await BridgedERC20Factory.new()).address, { from: this.deployer });
    await this.factory.methods.setCreationPayment(this.payment).send({ from: this.deployer });
    await this.factory.methods.setAdmin(this.admin).send({ from: this.deployer });
    expect(await this.factory.methods.creationPayment().call()).to.equal(this.payment);
    expect(await this.factory.methods.admin().call()).to.equal(this.admin);
  });

  it('should create succeed', async function () {
    const tx = await this.factory.methods.create('BridgedERC20', 'BERC20', 18).send({ from: this.deployer, value: this.payment });
    this.token = new web3.eth.Contract(BridgedERC20.abi, tx.events[1].address, { from: this.admin });
    expect(await this.token.methods.name().call()).to.equal('BridgedERC20');
    expect(await this.token.methods.symbol().call()).to.equal('BERC20');
    expect(await this.token.methods.decimals().call()).to.equal('18');

    this.MINTER_ROLE = await this.token.methods.MINTER_ROLE().call();
    this.PAUSER_ROLE = await this.token.methods.PAUSER_ROLE().call();
    this.DEFAULT_ADMIN_ROLE = await this.token.methods.DEFAULT_ADMIN_ROLE().call();
    expect(await this.token.methods.hasRole(this.DEFAULT_ADMIN_ROLE, this.admin).call()).be.true;
    expect(await this.token.methods.hasRole(this.PAUSER_ROLE, this.admin).call()).be.true;
    expect(await this.token.methods.hasRole(this.DEFAULT_ADMIN_ROLE, this.deployer).call()).to.be.false;
    expect(await this.token.methods.hasRole(this.PAUSER_ROLE, this.deployer).call()).be.false;
  });

  it('should create failed for poor payment', async function () {
    let succeed = false;
    try {
      await this.factory.methods.create('BridgedERC20', 'BERC20', 18).send({ from: this.deployer, value: 100 });
      succeed = true;
    } catch (err) {}

    if (succeed) {
      assert('should create fail for poor payment');
    }
  });

  it('should withdraw succeed', async function () {
    const factoryBalanceBefore = await web3.eth.getBalance(this.factory._address);
    const toAddressBalanceBefore = await web3.eth.getBalance(this.to);
    await this.factory.methods.withdrawAll(this.to).send({ from: this.deployer });
    const factoryBalanceAfter = await web3.eth.getBalance(this.factory._address);
    const toAddressBalanceAfter = await web3.eth.getBalance(this.to);
    expect(Number(factoryBalanceBefore) - Number(this.payment)).to.equal(Number(factoryBalanceAfter));
    expect(Number(toAddressBalanceAfter) - Number(this.payment)).to.equal(Number(toAddressBalanceBefore));
  });

  it('should mint fail before grant role', async function () {
    let succeed = false;
    try {
      await this.token.methods.mint(this.user, 10).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail before grant role');
    }
  });

  it('should grant role succeed', async function () {
    await this.token.methods.grantRole(this.MINTER_ROLE, this.bridge1).send({ from: this.admin });
    await this.token.methods.grantRole(this.MINTER_ROLE, this.bridge2).send({ from: this.admin });
    expect(await this.token.methods.hasRole(this.MINTER_ROLE, this.bridge1).call()).be.true;
    expect(await this.token.methods.hasRole(this.MINTER_ROLE, this.bridge2).call()).be.true;
  });

  it('should mint fail before set cap', async function () {
    let succeed = false;
    try {
      await this.token.methods.mint(this.user, 10).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail before set cap');
    }
  });

  it('should set cap succeed', async function () {
    await this.token.methods.setMinterCap(this.bridge1, 100).send();
    await this.token.methods.setMinterCap(this.bridge2, 100).send();
    expect((await this.token.methods.minterSupply(this.bridge1).call()).cap).be.equal('100');
    expect((await this.token.methods.minterSupply(this.bridge2).call()).cap).be.equal('100');
  });

  it('should mint succeed(1)', async function () {
    await this.token.methods.mint(this.user, 10).send({ from: this.bridge1 });
    await this.token.methods.mint(this.user, 10).send({ from: this.bridge2 });
    const b1 = await this.token.methods.minterSupply(this.bridge1).call();
    const b2 = await this.token.methods.minterSupply(this.bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('10');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('10');
    expect(await this.token.methods.balanceOf(this.user).call()).be.equal('20');
  });

  it('should burn succeed', async function () {
    await this.token.methods.burn(1).send({ from: this.user });
    expect(await this.token.methods.balanceOf(this.user).call()).be.equal('19');
  });

  it('should burnFrom fail', async function () {
    let succeed = false;
    try {
      await this.token.methods.burnFrom(this.user, 1).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should burnFrom fail');
    }
  });

  it('should approve succeed', async function () {
    await this.token.methods.approve(this.bridge1, 100).send({ from: this.user });
    await this.token.methods.approve(this.bridge2, 100).send({ from: this.user });
    expect(await this.token.methods.allowance(this.user, this.bridge1).call()).be.equal('100');
    expect(await this.token.methods.allowance(this.user, this.bridge2).call()).be.equal('100');
  });

  it('should burnFrom succeed(1)', async function () {
    await this.token.methods.burnFrom(this.user, 5).send({ from: this.bridge1 });
    await this.token.methods.burnFrom(this.user, 5).send({ from: this.bridge2 });
    const b1 = await this.token.methods.minterSupply(this.bridge1).call();
    const b2 = await this.token.methods.minterSupply(this.bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('5');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('5');
    expect(await this.token.methods.balanceOf(this.user).call()).be.equal('9');
  });

  it('should pause succeed', async function () {
    await this.token.methods.pause().send({ from: this.admin });
  });

  it('should mint fail when paused', async function () {
    let succeed = false;
    try {
      await this.token.methods.mint(this.user, 1).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail when paused');
    }
  });

  it('should burnFrom fail when paused', async function () {
    let succeed = false;
    try {
      await this.token.methods.burnFrom(this.user, 1).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should burnFrom fail when paused');
    }
  });

  it('should unpause succeed', async function () {
    await this.token.methods.unpause().send({ from: this.admin });
  });

  it('should mint succeed(2)', async function () {
    await this.token.methods.mint(this.user, 95).send({ from: this.bridge1 });
    await this.token.methods.mint(this.user, 95).send({ from: this.bridge2 });
    const b1 = await this.token.methods.minterSupply(this.bridge1).call();
    const b2 = await this.token.methods.minterSupply(this.bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('100');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('100');
    expect(await this.token.methods.balanceOf(this.user).call()).be.equal(`${9 + 95 + 95}`);
  });

  it('should burnFrom succeed(2)', async function () {
    await this.token.methods.burnFrom(this.user, 5).send({ from: this.bridge1 });
    await this.token.methods.burnFrom(this.user, 5).send({ from: this.bridge2 });
    const b1 = await this.token.methods.minterSupply(this.bridge1).call();
    const b2 = await this.token.methods.minterSupply(this.bridge2).call();
    expect(b1.cap).be.equal('100');
    expect(b1.total).be.equal('95');
    expect(b2.cap).be.equal('100');
    expect(b2.total).be.equal('95');
    expect(await this.token.methods.balanceOf(this.user).call()).be.equal(`${9 + 95 + 95 - 10}`);
  });

  it('should mint fail when too many this.token minted', async function () {
    let succeed = false;
    try {
      await this.token.methods.mint(this.user, 100).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail when too many this.token minted');
    }
  });

  it('should revoke role succeed', async function () {
    await this.token.methods.revokeRole(this.MINTER_ROLE, this.bridge1).send();
    await this.token.methods.revokeRole(this.MINTER_ROLE, this.bridge2).send();
    expect(await this.token.methods.hasRole(this.MINTER_ROLE, this.bridge1).call()).be.false;
    expect(await this.token.methods.hasRole(this.MINTER_ROLE, this.bridge2).call()).be.false;
  });

  it('should mint fail after revoke role', async function () {
    let succeed = false;
    try {
      await this.token.methods.mint(this.user, 1).send({ from: this.bridge1 });
      succeed = true;
    } catch (err) {
      // ignore
    }

    if (succeed) {
      assert('should mint fail after revoke role');
    }
  });
});
