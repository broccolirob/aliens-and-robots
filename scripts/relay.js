const {handler} = require('../autotasks/relay')

if (require.main === module) {
  require('dotenv').config()
  const {RELAYER_KEY: apiKey, RELAYER_SECRET: apiSecret} = process.env
  const payload = require('fs').readFileSync('tmp/request.json')
  handler({apiKey, apiSecret, request: {body: JSON.parse(payload)}})
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
