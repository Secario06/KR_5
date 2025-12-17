const generatePassword = (req, res) => {
  try {
    // Получаем параметры из query или body
    const params = req.method === "GET" ? req.query : req.body

    const length = Number.parseInt(params.length) || 12
    const includeUppercase = params.uppercase === "true" || params.uppercase === true
    const includeLowercase = params.lowercase === "true" || params.lowercase === true
    const includeNumbers = params.numbers === "true" || params.numbers === true
    const includeSymbols = params.symbols === "true" || params.symbols === true

    // Формируем набор символов
    let charset = ""
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeNumbers) charset += "0123456789"
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (charset === "") {
      return res.status(400).json({
        success: false,
        error: "Необходимо выбрать хотя бы один тип символов",
      })
    }

    // Генерируем пароль
    let password = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }

    // Вычисляем силу пароля
    const strength = calculateStrength(password)

    res.json({
      success: true,
      password,
      length,
      strength,
      timestamp: new Date().toISOString(),
      options: {
        uppercase: includeUppercase,
        lowercase: includeLowercase,
        numbers: includeNumbers,
        symbols: includeSymbols,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Ошибка при генерации пароля",
    })
  }
}

const checkPasswordStrength = (req, res) => {
  try {
    // Получаем пароль из параметра URL или из тела запроса
    const password = req.params.password || req.body.password

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Пароль не предоставлен",
      })
    }

    const strength = calculateStrength(password)

    res.json({
      success: true,
      password,
      strength,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Ошибка при проверке силы пароля",
    })
  }
}

// Вспомогательная функция для расчета силы пароля
function calculateStrength(password) {
  let score = 0
  const checks = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    length: password.length,
  }

  // Подсчет баллов
  if (checks.hasLowercase) score += 1
  if (checks.hasUppercase) score += 1
  if (checks.hasNumbers) score += 1
  if (checks.hasSymbols) score += 2

  if (checks.length >= 12) score += 2
  else if (checks.length >= 8) score += 1

  // Определяем уровень силы
  let level, label, color
  if (score <= 2) {
    level = 1
    label = "Слабый"
    color = "#ef4444"
  } else if (score <= 4) {
    level = 2
    label = "Средний"
    color = "#f59e0b"
  } else if (score <= 6) {
    level = 3
    label = "Хороший"
    color = "#3b82f6"
  } else {
    level = 4
    label = "Отличный"
    color = "#10b981"
  }

  return {
    score,
    level,
    label,
    color,
    checks,
  }
}

module.exports = {
  generatePassword,
  checkPasswordStrength,
}
