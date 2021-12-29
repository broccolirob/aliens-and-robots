const {expect} = require('chai')
const {deployments, ethers} = require('hardhat')
const {signMetaTxRequest} = require('../src/signer')

describe('contracts/Registry.sol', function () {
  before(async function () {
    await deployments.fixture(['MinimalForwarder', 'Registry'])
    const forwarder = await deployments.get('MinimalForwarder')
    const registry = await deployments.get('Registry')
    const {deployer, user, signer, relayer} = await getNamedAccounts()
    this.forwarder = new ethers.Contract(forwarder.address, forwarder.abi)
    this.registry = new ethers.Contract(registry.address, registry.abi)
    this.accounts = [deployer, user, signer, relayer]
  })

  it('registers a name directly', async function () {
    const sender = await ethers.getSigner(this.accounts[1])
    const registry = this.registry.connect(sender)
    const receipt = await registry.register('testing').then(tx => tx.wait())

    expect(receipt.events[0].event).to.equal('Registered')
    expect(await registry.owners('testing')).to.equal(sender.address)
    expect(await registry.names(sender.address)).to.equal('testing')
  })

  it('registers a name via a meta-tx', async function () {
    const deployer = await ethers.getSigner(this.accounts[0])
    const signer = await ethers.getSigner(this.accounts[2])
    const relayer = await ethers.getSigner(this.accounts[3])
    const forwarder = this.forwarder.connect(relayer)
    const registry = this.registry.connect(deployer)

    const {request, signature} = await signMetaTxRequest(signer, forwarder, {
      from: signer.address,
      to: registry.address,
      data: registry.interface.encodeFunctionData('register', [
        'gassless_username',
      ]),
    })

    await forwarder.execute(request, signature).then(tx => tx.wait())

    expect(await registry.owners('gassless_username')).to.equal(signer.address)
    expect(await registry.names(signer.address)).to.equal('gassless_username')
  })
})
