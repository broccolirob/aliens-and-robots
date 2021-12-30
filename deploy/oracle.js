module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()
  const linkAddress = '0x01BE23585060835E02B77ef475b0Cc51aA1e0709'

  await deploy('OracleWrapper', {
    from: deployer,
    args: [linkAddress],
    log: true,
  })
}

module.exports.tags = ['OracleWrapper']
