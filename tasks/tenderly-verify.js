module.exports = task(
  'tenderly-verify',
  'Verifies and uploads contracts to Tenderly',
  async (_, {network, tenderly, deployments}) => {
    if (['hardhat', 'localhost'].includes(network.name)) {
      throw Error('Tenderly verification is not available on local networks.')
    }
    const characterImpl = await deployments.get('Character_Implementation')
    const characterProxy = await deployments.get('Character_Proxy')
    const contracts = [
      {
        name: 'Character',
        network: network.name,
        address: characterImpl.address,
      },
      {
        name: 'UUPSProxy',
        network: network.name,
        address: characterProxy.address,
      },
    ]
    console.log('Verifying and pushing the following contracts:', contracts)
    await tenderly.verify(...contracts)
    await tenderly.push(...contracts)
  },
)
