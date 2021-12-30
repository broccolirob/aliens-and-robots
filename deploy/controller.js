module.exports = async ({getNamedAccounts, deployments, ethers}) => {
  const {deploy, execute} = deployments
  const {deployer} = await getNamedAccounts()
  const deployerSigner = await ethers.getNamedSigner('deployer')
  const characterNFT = await ethers.getContract('CharacterNFT', deployerSigner)
  const oracle = await deployments.get('OracleWrapper')

  const vrf = '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B'
  const keyHash =
    '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311'
  const jobId =
    '0x3634646362663636353964643466633539643264633363353136376662646139'
  const vrfFee = ethers.utils.parseEther('0.1')
  const oracleFee = ethers.utils.parseEther('0.1')

  const controller = await deploy('Controller', {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'OptimizedTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [
            vrf,
            oracle.address,
            keyHash,
            jobId,
            vrfFee,
            oracleFee,
            characterNFT.address,
          ],
        },
      },
    },
    log: true,
  })

  // if (controller.newlyDeployed) {
  //   const minterRole = await characterNFT.MINTER_ROLE()
  //   await execute(
  //     'CharacterNFT',
  //     {from: deployer},
  //     'grantRole',
  //     minterRole,
  //     controller.address,
  //   )
  // }
}

module.exports.tags = ['Controller']
module.exports.dependencies = ['CharacterNFT']
