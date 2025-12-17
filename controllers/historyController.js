let history = []
let idCounter = 1

const getAllHistory = (req, res) => {
  try {
    // Поддержка query параметра limit
    const limit = Number.parseInt(req.query.limit) || history.length
    const limitedHistory = history.slice(-limit)

    res.json({
      success: true,
      count: limitedHistory.length,
      history: limitedHistory,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Ошибка при получении истории",
    })
  }
}

const addToHistory = (req, res) => {
  try {
    const { password, length, strength, options } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Пароль не предоставлен",
      })
    }

    const historyItem = {
      id: idCounter++,
      password,
      length,
      strength,
      options,
      timestamp: new Date().toISOString(),
    }

    history.push(historyItem)

    // Ограничиваем историю 50 записями
    if (history.length > 50) {
      history.shift()
    }

    res.status(201).json({
      success: true,
      item: historyItem,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Ошибка при добавлении в историю",
    })
  }
}

const deleteHistoryItem = (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const index = history.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: "Запись не найдена",
      })
    }

    history.splice(index, 1)

    res.json({
      success: true,
      message: "Запись удалена",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Ошибка при удалении записи",
    })
  }
}

const clearHistory = (req, res) => {
  try {
    history = []

    res.json({
      success: true,
      message: "История очищена",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Ошибка при очистке истории",
    })
  }
}

module.exports = {
  getAllHistory,
  addToHistory,
  deleteHistoryItem,
  clearHistory,
}
