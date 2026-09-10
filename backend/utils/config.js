require('dotenv').config()

const PORT = process.env.PORT || 3003

const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL

const OWNER_PASSWORD = process.env.OWNER_PASSWORD
const SESSION_SECRET = process.env.SESSION_SECRET

module.exports = { PORT, DATABASE_URL, OWNER_PASSWORD, SESSION_SECRET }
