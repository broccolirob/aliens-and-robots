// module.exports = async ({getNamedAccounts, deployments}) => {
//   const {deploy, execute} = deployments
//   const {deployer} = await getNamedAccounts()

//   const MinimalForwarder = await deployments.get('MinimalForwarder')
//   const Consumer = await deployments.get('Consumer')

//   const result = await deploy('Registry', {
//     from: deployer,
//     args: [MinimalForwarder.address, Consumer.address],
//     log: true,
//   })

//   await execute('Consumer', {from: deployer}, 'setRegistry', result.address);
// }

// module.exports.tags = ['Registry']
// module.exports.dependencies = ['MinimalForwarder', 'Consumer']

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()

  const aliens = ['QmeCA3Tnob9J5mJHdiX2FkFqx2vq3eJ1aqiqTHfi83RQJ5']
  const robots = ['QmU7WWz2aoEwMStKNH6LdbKNx63x8H4EdXmuT9Ldh38nnA']

  await deploy('CharacterNFT', {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OptimizedTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [aliens, robots],
        },
      },
    },
    log: true,
  })
}

module.exports.tags = ['CharacterNFT']
