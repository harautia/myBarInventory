const pageViewsRouter = require('express').Router()
const PageViews = require('../models/pageViews')

pageViewsRouter.post('/', async (request, response) => {
  await PageViews.record()
  const count = await PageViews.getCount()
  response.json({ count })
})

module.exports = pageViewsRouter
