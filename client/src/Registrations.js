import {useContext, useState, useEffect} from 'react'
import Blockies from 'react-blockies'
import {EthereumContext} from './eth/context'

const mapEvent = event => ({
  blockNumber: event.blockNumber,
  who: event.args.who,
  name: event.args.name,
  id: `${event.blockHash}/${event.transactionIndex}/${event.logIndex}`,
})

export default function Registrations() {
  const {registry} = useContext(EthereumContext)
  const [registrations, setRegistrations] = useState(undefined)

  useEffect(() => {
    const filter = registry.filters.Registered()

    const listener = (...args) => {
      const event = args[args.length - 1]
      setRegistrations(rs => [mapEvent(event), ...(rs || [])])
    }

    const subscribe = async () => {
      const past = await registry.queryFilter(filter)
      setRegistrations((past.reverse() || []).map(mapEvent))
      registry.on(filter, listener)
    }

    subscribe()
    return () => registry.off(filter, listener)
  }, [registry])

  return (
    <div>
      <h3>Latest Registrations</h3>
      {registrations === undefined && <span>Loading...</span>}
      {registrations && (
        <ul className="divide-y divide-gray-200">
          {registrations.map(r => (
            <li key={r.id} className="flex justify-start py-4">
              <Blockies
                seed={r.who.toLowerCase()}
                size={8}
                scale={5}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                <p className="w-48 text-sm text-gray-500 truncate sm:w-full">{r.who}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
