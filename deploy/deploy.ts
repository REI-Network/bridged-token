import type { DeployFunction } from 'hardhat-deploy/dist/types';
import type Web3 from 'web3';

declare const web3: Web3;

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const admin = deployer;
  const payment = 10000;
  const bridgedERC20Factory = await deploy('BridgedERC20Factory', {
    from: deployer,
    log: true,
    deterministicDeployment: false
  });
  const factory = new web3.eth.Contract(bridgedERC20Factory.abi, bridgedERC20Factory.address, { from: deployer });
  await factory.methods.setCreationPayment(payment).send({ from: deployer });
  await factory.methods.setAdmin(admin).send({ from: deployer });
  console.log('Factory address is : ', bridgedERC20Factory.address);
  console.log('creationPayment', await factory.methods.creationPayment().call());
  console.log('admin', await factory.methods.admin().call());
};

export default func;
