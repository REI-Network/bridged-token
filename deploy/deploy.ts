import type { DeployFunction } from 'hardhat-deploy/dist/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const deloyToken = async (name: string, symbol: string, decimals: number) => {
    const token = await deploy('BridgedERC20', {
      from: deployer,
      log: true,
      deterministicDeployment: false,
      args: [name, symbol, decimals]
    });

    console.log('name:', name, 'symbol:', symbol, 'decimals:', decimals, 'deployed at:', token.address);
  };

  await deloyToken('Wrapped BTC', 'WBTC', 8);
  await deloyToken('Tether USD', 'USDT', 6);
  await deloyToken('USD Coin', 'USDC', 6);
  await deloyToken('Wrapped Ether', 'WETH', 18);
  await deloyToken('Dai Stablecoin', 'DAI', 18);
};

export default func;
