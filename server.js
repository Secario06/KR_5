const express = require("express")
const path = require("path")
const passwordRoutes = require("./routes/passwordRoutes")
const historyRoutes = require("./routes/historyRoutes")
const loggerMiddleware = require("./middleware/logger")
const errorMiddleware = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware для обработки JSON и URL-encoded данных
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Собственный middleware для логирования
app.use(loggerMiddleware)

// Раздача статических файлов
app.use(express.static(path.join(__dirname, "public")))

// Маршруты API
app.use("/api/password", passwordRoutes)
app.use("/api/history", historyRoutes)

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Middleware для обработки ошибок (должен быть последним)
app.use(errorMiddleware)

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
  console.log(`📝 Логи запросов отображаются в консоли`)
})

module.exports = app
