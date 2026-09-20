const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // A correct password shouldn't cost the legitimate owner their remaining
  // budget just because earlier attempts were mistyped.
  skipSuccessfulRequests: true,
  message: { error: 'too many login attempts, please try again later' }
})

module.exports = { loginLimiter }
