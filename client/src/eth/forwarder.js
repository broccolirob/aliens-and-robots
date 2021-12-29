import {ethers} from 'ethers'
import deployment from './kovan/deploy.json'

export function createInstance(provider) {
  const {address, abi} = deployment.contracts.MinimalForwarder
  return new ethers.Contract(address, abi, provider)
}
