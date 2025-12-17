const express = require("express")
const router = express.Router()
const historyController = require("../controllers/historyController")

// GET /api/history - получить всю историю
router.get("/", historyController.getAllHistory)

// POST /api/history - добавить запись в историю
router.post("/", historyController.addToHistory)

// DELETE /api/history/:id - удалить запись по ID
router.delete("/:id", historyController.deleteHistoryItem)

// DELETE /api/history - очистить всю историю
router.delete("/", historyController.clearHistory)

module.exports = router
