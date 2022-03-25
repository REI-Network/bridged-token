import type { DeployFunction } from 'hardhat-deploy/dist/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const token = await deploy('BridgedERC20', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: ['BridgedERC20', 'BridgedERC20', 18]
  });

  console.log('token at:', token.address);
};

export default func;
