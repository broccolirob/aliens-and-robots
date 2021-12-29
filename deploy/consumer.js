// module.exports = async ({getNamedAccounts, deployments, ethers}) => {
//   const {deploy} = deployments
//   const {deployer} = await getNamedAccounts()

//   const oracle = await deployments.get('Oracle')

//   const result = await deploy('Consumer', {
//     from: deployer,
//     args: [oracle.address],
//     log: true,
//   })
// }

// module.exports.tags = ['Consumer']
// module.exports.dependencies = ['Oracle']
