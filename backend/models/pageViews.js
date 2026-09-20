const db = require('../db/db')

const record = async () => {
  await db('page_views').insert({})
}

const getCount = async () => {
  const [{ count }] = await db('page_views').count('id as count')
  return Number(count)
}

module.exports = { record, getCount }
