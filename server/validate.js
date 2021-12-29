const Filter = require('bad-words')

async function validate(event, context) {
  const {name} = event.queryStringParameters
  const filter = new Filter()
  const isClean = !filter.isProfane(name)

  return {
    statusCode: 200,
    body: JSON.stringify(isClean),
  }
}

export const handler = validate
