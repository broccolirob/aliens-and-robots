const Filter = require('bad-words')

async function validate(event, context) {
  try {
    const d = JSON.parse(event.body)
    const filter = new Filter()
    const isClean = !filter.isProfane(d.data.name)

    return {
      statusCode: 200,
      body: JSON.stringify({result: isClean}),
    }
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    }
  }
}

export const handler = validate
