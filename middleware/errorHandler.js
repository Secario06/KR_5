const errorMiddleware = (err, req, res, next) => {
  console.error("❌ Ошибка:", err.stack)

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Внутренняя ошибка сервера",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorMiddleware
