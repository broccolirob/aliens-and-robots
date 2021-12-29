import {ethers} from 'ethers'

export function createProvider() {
  return new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_ALCHEMY_URL,
    42,
  )
}
