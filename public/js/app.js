class PasswordGenerator {
  constructor() {
    this.initElements()
    this.attachEventListeners()
    this.loadHistory()
  }

  initElements() {
    // Элементы генератора
    this.lengthSlider = document.getElementById("length")
    this.lengthValue = document.getElementById("lengthValue")
    this.uppercaseCheck = document.getElementById("uppercase")
    this.lowercaseCheck = document.getElementById("lowercase")
    this.numbersCheck = document.getElementById("numbers")
    this.symbolsCheck = document.getElementById("symbols")
    this.generateBtn = document.getElementById("generateBtn")
    this.passwordOutput = document.getElementById("passwordOutput")
    this.copyBtn = document.getElementById("copyBtn")

    // Элементы силы пароля
    this.strengthBar = document.getElementById("strengthBar")
    this.strengthFill = document.querySelector(".strength-fill")
    this.strengthLabel = document.getElementById("strengthLabel")

    // Элементы истории
    this.historyList = document.getElementById("historyList")
    this.clearHistoryBtn = document.getElementById("clearHistoryBtn")

    // Toast
    this.toast = document.getElementById("toast")
  }

  attachEventListeners() {
    // Обновление значения длины
    this.lengthSlider.addEventListener("input", (e) => {
      this.lengthValue.textContent = e.target.value
    })

    // Генерация пароля
    this.generateBtn.addEventListener("click", () => this.generatePassword())

    // Копирование пароля
    this.copyBtn.addEventListener("click", () => this.copyPassword())

    // Очистка истории
    this.clearHistoryBtn.addEventListener("click", () => this.clearHistory())

    // Генерация по Enter в поле вывода
    this.passwordOutput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.generatePassword()
    })
  }

  async generatePassword() {
    const options = {
      length: Number.parseInt(this.lengthSlider.value),
      uppercase: this.uppercaseCheck.checked,
      lowercase: this.lowercaseCheck.checked,
      numbers: this.numbersCheck.checked,
      symbols: this.symbolsCheck.checked,
    }

    // Проверка, что выбран хотя бы один тип символов
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
      this.showToast("Выберите хотя бы один тип символов!", "error")
      return
    }

    try {
      // Анимация кнопки
      this.generateBtn.disabled = true
      this.generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation: spin 1s linear infinite;">
          <path d="M17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Генерация...
      `

      // POST запрос к API
      const response = await fetch("/api/password/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      const data = await response.json()

      if (data.success) {
        this.passwordOutput.value = data.password
        this.copyBtn.disabled = false
        this.updateStrengthBar(data.strength)

        // Добавляем в историю
        await this.addToHistory(data)

        this.showToast("Пароль сгенерирован!", "success")
      } else {
        this.showToast(data.error || "Ошибка генерации", "error")
      }
    } catch (error) {
      console.error("Ошибка при генерации:", error)
      this.showToast("Ошибка подключения к серверу", "error")
    } finally {
      // Восстанавливаем кнопку
      this.generateBtn.disabled = false
      this.generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M17 3L17 7L13 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Сгенерировать пароль
      `
    }
  }

  updateStrengthBar(strength) {
    this.strengthBar.classList.remove("hidden")
    this.strengthLabel.classList.remove("hidden")

    const widthPercent = (strength.level / 4) * 100
    this.strengthFill.style.width = `${widthPercent}%`
    this.strengthFill.style.backgroundColor = strength.color

    this.strengthLabel.textContent = `Надежность: ${strength.label} (${strength.score}/9)`
    this.strengthLabel.style.color = strength.color
  }

  async copyPassword() {
    try {
      await navigator.clipboard.writeText(this.passwordOutput.value)
      this.showToast("Пароль скопирован в буфер обмена!", "success")

      // Анимация кнопки
      this.copyBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 10L8 13L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `

      setTimeout(() => {
        this.copyBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 13H4C3.448 13 3 12.552 3 12V4C3 3.448 3.448 3 4 3H12C12.552 3 13 3.448 13 4V5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        `
      }, 2000)
    } catch (error) {
      this.showToast("Ошибка при копировании", "error")
    }
  }

  async loadHistory() {
    try {
      const response = await fetch("/api/history?limit=10")
      const data = await response.json()

      if (data.success && data.history.length > 0) {
        this.renderHistory(data.history)
        this.clearHistoryBtn.disabled = false
      }
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error)
    }
  }

  async addToHistory(passwordData) {
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      })

      if (response.ok) {
        await this.loadHistory()
      }
    } catch (error) {
      console.error("Ошибка при добавлении в историю:", error)
    }
  }

  renderHistory(history) {
    if (history.length === 0) {
      this.historyList.innerHTML = '<p class="empty-state">История пуста. Сгенерируйте первый пароль!</p>'
      this.clearHistoryBtn.disabled = true
      return
    }

    this.historyList.innerHTML = history
      .reverse()
      .map(
        (item) => `
      <div class="history-item" data-id="${item.id}">
        <span class="history-password">${item.password}</span>
        <span class="history-strength" style="background: ${item.strength.color}22; color: ${item.strength.color}">
          ${item.strength.label}
        </span>
        <div class="history-actions">
          <button class="history-btn copy-history-btn" onclick="app.copyHistoryPassword('${item.password}')">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M5 13H4C3.448 13 3 12.552 3 12V4C3 3.448 3.448 3 4 3H12C12.552 3 13 3.448 13 4V5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button class="history-btn delete-btn" onclick="app.deleteHistoryItem(${item.id})">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    `,
      )
      .join("")

    this.clearHistoryBtn.disabled = false
  }

  async copyHistoryPassword(password) {
    try {
      await navigator.clipboard.writeText(password)
      this.showToast("Пароль скопирован!", "success")
    } catch (error) {
      this.showToast("Ошибка при копировании", "error")
    }
  }

  async deleteHistoryItem(id) {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await this.loadHistory()
        this.showToast("Запись удалена", "success")
      }
    } catch (error) {
      this.showToast("Ошибка при удалении", "error")
    }
  }

  async clearHistory() {
    if (!confirm("Вы уверены, что хотите очистить всю историю?")) {
      return
    }

    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
      })

      if (response.ok) {
        this.historyList.innerHTML = '<p class="empty-state">История пуста. Сгенерируйте первый пароль!</p>'
        this.clearHistoryBtn.disabled = true
        this.showToast("История очищена", "success")
      }
    } catch (error) {
      this.showToast("Ошибка при очистке истории", "error")
    }
  }

  showToast(message, type = "success") {
    this.toast.textContent = message
    this.toast.className = `toast ${type}`

    setTimeout(() => {
      this.toast.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        this.toast.classList.add("hidden")
        this.toast.style.animation = ""
      }, 300)
    }, 3000)
  }
}

// Добавляем стиль для анимации вращения
const style = document.createElement("style")
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)

// Инициализация приложения
const app = new PasswordGenerator()

// Генерация первого пароля при загрузке
window.addEventListener("load", () => {
  app.generatePassword()
})
