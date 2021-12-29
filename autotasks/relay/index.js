const ethers = require('ethers')
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require('defender-relay-client/lib/ethers')
const forwarderInfo = require('../../deployments/kovan/MinimalForwarder.json')
const registryInfo = require('../../deployments/kovan/Registry.json')

async function relay(forwarder, request, signature, whitelist) {
  // Business logic to decide whether or not to pay for txn
  const accepts = !whitelist || whitelist.includes(request.to)
  if (!accepts) throw new Error(`Rejected request to ${request.to}`)

  const valid = await forwarder.verify(request, signature)
  if (!valid) throw new Error('Invalid request')

  const gasLimit = (parseInt(request.gas) + 50000).toString()
  return await forwarder.execute(request, signature, {gasLimit})
}

async function handler(event) {
  if (!event.request || !event.request.body) throw new Error('Missing payload')
  const {request, signature} = event.request.body
  console.log('Relaying', request)

  const credentials = {...event}
  const provider = new DefenderRelayProvider(credentials)
  const signer = new DefenderRelaySigner(credentials, provider, {speed: 'fast'})
  const forwarder = new ethers.Contract(
    forwarderInfo.address,
    forwarderInfo.abi,
    signer,
  )

  const tx = await relay(forwarder, request, signature)
  console.log(`Sent meta-tx: ${tx.hash}`)
  return {txHash: tx.hash}
}

module.exports = {
  handler,
  relay,
}
