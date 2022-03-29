import type Web3 from 'web3';
import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-web3';
import '@nomiclabs/hardhat-truffle5';

async function createWeb3Contract({ name, artifactName, address, deployments, web3, from, artifacts }: any) {
  const { get } = deployments;
  return new (web3 as Web3).eth.Contract(artifacts.require(artifactName ?? name).abi, address ?? (await get(name)).address, from ? { from } : undefined);
}

async function roleToBytes32(role: string, token: any) {
  let bytes32: any;
  if (role === 'minter') {
    bytes32 = await token.methods.MINTER_ROLE().call();
  } else if (role === 'pauser') {
    bytes32 = await token.methods.PAUSER_ROLE().call();
  } else {
    throw new Error('unsupported role: ' + role);
  }
  return bytes32;
}

task('accounts', 'List accounts').setAction(async (taskArgs, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

task('grant-role', 'grant role to target address')
  .addParam('token', 'token address')
  .addParam('address', 'target address')
  .addParam('role', 'role')
  .setAction(async (taskArgs, { web3, getNamedAccounts, artifacts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const token = await createWeb3Contract({ artifactName: 'BridgedERC20', address: taskArgs.token, deployments, web3, artifacts, from: deployer });
    const role = await roleToBytes32(taskArgs.role, token);
    await token.methods.grantRole(role, taskArgs.address).send();
    console.log('Grant', taskArgs.role, 'role to', taskArgs.address, 'succeed');
  });

task('revoke-role', 'revoke role from target address')
  .addParam('token', 'token address')
  .addParam('address', 'target address')
  .addParam('role', 'role')
  .setAction(async (taskArgs, { web3, getNamedAccounts, artifacts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const token = await createWeb3Contract({ artifactName: 'BridgedERC20', address: taskArgs.token, deployments, web3, artifacts, from: deployer });
    const role = await roleToBytes32(taskArgs.role, token);
    await token.methods.revokeRole(role, taskArgs.address).send();
    console.log('Revoke', taskArgs.role, 'role from', taskArgs.address, 'succeed');
  });

task('has-role', 'check if the address has role')
  .addParam('token', 'token address')
  .addParam('address', 'target address')
  .addParam('role', 'role')
  .setAction(async (taskArgs, { web3, getNamedAccounts, artifacts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const token = await createWeb3Contract({ artifactName: 'BridgedERC20', address: taskArgs.token, deployments, web3, artifacts, from: deployer });
    const role = await roleToBytes32(taskArgs.role, token);
    console.log(await token.methods.hasRole(role, taskArgs.address).call());
  });

task('set-cap', 'set minter capability')
  .addParam('token', 'token address')
  .addParam('address', 'minter address')
  .addParam('cap', 'minter capability')
  .setAction(async (taskArgs, { web3, getNamedAccounts, artifacts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const token = await createWeb3Contract({ artifactName: 'BridgedERC20', address: taskArgs.token, deployments, web3, artifacts, from: deployer });
    await token.methods.setMinterCap(taskArgs.address, taskArgs.cap).send();
    console.log('Set miner capability succeed');
  });

task('minter-supply', 'print minter supply information')
  .addParam('token', 'token address')
  .addParam('address', 'minter address')
  .setAction(async (taskArgs, { web3, getNamedAccounts, artifacts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const token = await createWeb3Contract({ artifactName: 'BridgedERC20', address: taskArgs.token, deployments, web3, artifacts, from: deployer });
    const info = await token.methods.minterSupply(taskArgs.address).call();
    console.log('cap:', Number(info.cap), 'total:', Number(info.total));
  });
