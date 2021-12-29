module.exports = async ({getNamedAccounts, deployments, ethers}) => {
  const {deploy, execute} = deployments
  const {deployer} = await getNamedAccounts()
  const deployerSigner = await ethers.getNamedSigner('deployer')
  const characterNFT = await ethers.getContract('CharacterNFT', deployerSigner)

  const vrf = '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B'
  const oracle = ethers.constants.AddressZero
  const keyHash =
    '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311'
  const jobId = ethers.constants.HashZero
  const vrfFee = ethers.utils.parseEther('0.1')
  const oracleFee = ethers.utils.parseEther('0.01')

  const controller = await deploy('Controller', {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OptimizedTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          vrf,
          oracle,
          keyHash,
          jobId,
          vrfFee,
          oracleFee,
          characterNFT.address,
        ],
      },
    },
    log: true,
  })

  if (controller.newlyDeployed) {
    const minterRole = await characterNFT.MINTER_ROLE()
    await execute(
      'CharacterNFT',
      {from: deployer},
      'grantRole',
      minterRole,
      controller.address,
    )
  }
}

module.exports.tags = ['Controller']
module.exports.dependencies = ['CharacterNFT']
