import {EthereumContext} from './eth/context'
import {createProvider} from './eth/provider'
import {createInstance} from './eth/registry'

import './App.css'
import Registrations from './Registrations'
import Register from './Register'

function App() {
  const provider = createProvider()
  const registry = createInstance(provider)
  const ethereumContext = {provider, registry}

  return (
    <EthereumContext.Provider value={ethereumContext}>
      <div className="flex flex-col items-center">
        <header className="my-10">
          <h1 className="text-2xl">Names Registry</h1>
        </header>
        <main className="sm:w-96">
          <Register />
          <Registrations />
        </main>
      </div>
    </EthereumContext.Provider>
  )
}

export default App
