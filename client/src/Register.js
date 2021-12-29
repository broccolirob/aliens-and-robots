import {useRef, useState, useContext} from 'react'
import {registerName} from './eth/register'
import {EthereumContext} from './eth/context'

export default function Register() {
  const nameInput = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const {registry, provider} = useContext(EthereumContext)

  const sendTx = async event => {
    event.preventDefault()
    const name = nameInput.current.value
    setSubmitting(true)

    try {
      await registerName(registry, provider, name)
      nameInput.current.value = ''
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
      <form onSubmit={sendTx} className="flex flex-col my-10">
        <input
          type="text"
          placeholder="Register your username"
          name="name"
          id="name"
          ref={nameInput}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 my-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
  )
}
