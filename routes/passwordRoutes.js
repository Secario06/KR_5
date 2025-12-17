const express = require("express")
const router = express.Router()
const passwordController = require("../controllers/passwordController")
const validateMiddleware = require("../middleware/validate")

// GET /api/password/generate - генерация пароля через query параметры
router.get("/generate", validateMiddleware, passwordController.generatePassword)

// POST /api/password/generate - генерация пароля через тело запроса
router.post("/generate", validateMiddleware, passwordController.generatePassword)

// GET /api/password/strength/:password - проверка силы пароля через параметр
router.get("/strength/:password", passwordController.checkPasswordStrength)

// POST /api/password/check - проверка силы пароля через тело запроса
router.post("/check", passwordController.checkPasswordStrength)

module.exports = router
