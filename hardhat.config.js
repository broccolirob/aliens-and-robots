require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-deploy-tenderly')
require('hardhat-gas-reporter')
require('hardhat-deploy')
require('solidity-coverage')
require('hardhat-docgen')
require('./tasks/accounts')
require('./tasks/balance')
require('./tasks/block-number')
require('./tasks/tenderly-verify')

module.exports = {
  defaultNetwork: 'rinkeby',
  solidity: {
    compilers: [
      {
        version: '0.8.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_URL,
      },
    },
    localhost: {
      url: 'http://localhost:8545',
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    kovan: {
      url: process.env.KOVAN_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
    user: 1,
    signer: 2,
    relayer: 3,
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT,
    username: process.env.TENDERLY_USERNAME,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    coinmarketcap: process.env.COINMARKETCAP_KEY,
    currency: 'USD',
  },
  docgen: {
    path: './docs',
    clear: true,
    except: [],
  },
}
