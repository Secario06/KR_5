const validateMiddleware = (req, res, next) => {
  const params = req.method === "GET" ? req.query : req.body

  // Валидация длины пароля
  if (params.length) {
    const length = Number.parseInt(params.length)

    if (isNaN(length)) {
      return res.status(400).json({
        success: false,
        error: "Длина пароля должна быть числом",
      })
    }

    if (length < 4 || length > 128) {
      return res.status(400).json({
        success: false,
        error: "Длина пароля должна быть от 4 до 128 символов",
      })
    }
  }

  // Проверяем, что хотя бы один тип символов выбран
  const hasAnyType = params.uppercase || params.lowercase || params.numbers || params.symbols

  if (params.length && !hasAnyType) {
    return res.status(400).json({
      success: false,
      error: "Необходимо выбрать хотя бы один тип символов",
    })
  }

  next()
}

module.exports = validateMiddleware
