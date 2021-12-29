const {ethers, deployments} = require('hardhat')
const {signMetaTxRequest} = require('../src/signer')
const {writeFileSync} = require('fs')

const name = process.env.NAME || 'sign-test'

async function main() {
  const forwarder = await ethers.getContract('MinimalForwarder')
  const registry = await ethers.getContract('Registry')

  const signer = ethers.Wallet.createRandom()
  const from = signer.address
  console.log(`Signing registration of ${name} as ${from}...`)
  const data = registry.interface.encodeFunctionData('register', [name])
  const result = await signMetaTxRequest(signer, forwarder, {
    to: registry.address,
    from,
    data,
  })
  writeFileSync('tmp/request.json', JSON.stringify(result, null, 2))
  console.log('Signature: ', result.signature)
  console.log('Request: ', result.request)
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
