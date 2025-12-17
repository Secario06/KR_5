// Middleware для логирования всех запросов

const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = req.ip || req.connection.remoteAddress

  // Логируем запрос
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`)

  if (req.query && Object.keys(req.query).length > 0) {
    console.log("  Query params:", req.query)
  }

  if (req.body && Object.keys(req.body).length > 0 && req.body.password) {
    // Не логируем сам пароль для безопасности
    console.log("  Body: { password: [скрыт], ... }")
  } else if (req.body && Object.keys(req.body).length > 0) {
    console.log("  Body:", req.body)
  }

  // Измеряем время обработки запроса
  const startTime = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - startTime
    console.log(`  ↳ Status: ${res.statusCode} - Duration: ${duration}ms\n`)
  })

  next()
}

module.exports = loggerMiddleware
