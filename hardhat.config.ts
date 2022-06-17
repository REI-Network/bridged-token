import '@typechain/hardhat';
import '@nomiclabs/hardhat-truffle5';
import 'hardhat-deploy';
import './tasks';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts = {
  mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
  accounts: [process.env.PRIVATEKEY]
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  typechain: {
    outDir: 'types',
    target: 'ethers-v5'
  },
  namedAccounts: {
    deployer: {
      localhost: 0,
      default: process.env.DEV_ADDR || 0
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.2',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    localhost: {
      live: false,
      saveDeployments: true,
      url: 'http://127.0.0.1:8545',
      loggingEnabled: true
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      gasPrice: 1e11,
      chainId: 1
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 3,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 1e11,
      gasMultiplier: 2
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 4,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 1e11,
      gasMultiplier: 2
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 5,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 1e11,
      gasMultiplier: 2
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 42,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 1e11,
      gasMultiplier: 2
    },
    'rei-testnet': {
      url: 'https://rpc-testnet.rei.network/',
      accounts,
      chainId: 12357,
      live: true,
      saveDeployments: true
    },
    'rei-mainnet': {
      url: 'https://rpc-mainnet.rei.network/',
      accounts,
      chainId: 47805,
      live: true,
      saveDeployments: true
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  }
};
