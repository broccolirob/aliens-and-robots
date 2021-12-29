const ForwardRequest = [
  {name: 'from', type: 'address'},
  {name: 'to', type: 'address'},
  {name: 'value', type: 'uint256'},
  {name: 'gas', type: 'uint256'},
  {name: 'nonce', type: 'uint256'},
  {name: 'data', type: 'bytes'},
]

function getMetaTxTypeData(chainId, verifyingContract) {
  return {
    types: {
      ForwardRequest,
    },
    domain: {
      name: 'MinimalForwarder',
      version: '0.0.1',
      chainId,
      verifyingContract,
    },
    primaryType: 'ForwardRequest',
  }
}

async function buildTypedData(forwarder, request) {
  const chainId = await forwarder.provider.getNetwork().then(n => n.chainId)
  const typeData = getMetaTxTypeData(chainId, forwarder.address)
  return {...typeData, message: request}
}

async function buildRequest(forwarder, input) {
  const nonce = await forwarder
    .getNonce(input.from)
    .then(nonce => nonce.toString())
  return {value: 0, gas: 1e6, nonce, ...input}
}

async function signMetaTxRequest(signer, forwarder, input) {
  const request = await buildRequest(forwarder, input)
  const toSign = await buildTypedData(forwarder, request)
  const signature = await signer._signTypedData(
    toSign.domain,
    toSign.types,
    request,
  )
  return {signature, request}
}

module.exports = {
  signMetaTxRequest,
}
