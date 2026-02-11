# Развертывание на Render (бесплатно)

## Шаг 1: Создай аккаунт на Render
Перейди на https://render.com и зарегистрируйся через GitHub

## Шаг 2: Создай новый Web Service
1. Нажми "New +"
2. Выбери "Web Service"
3. Выбери "Public Git repository"
4. Вставь ссылку на GitHub репозиторий

## Шаг 3: Настройки Deploy
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Node Version**: 18

## Шаг 4: Environment Variables
В разделе "Environment" добавь:
```
GROQ_API_KEY=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
GROQ_MODEL=llama-3.1-8b-instant
PORT=3000
NODE_ENV=production
```

## Шаг 5: Deploy
Нажми "Create Web Service" - ждай 2-3 минуты, сервер запустится

## Шаг 6: Копируй URL
После успешного деплоя ты получишь URL типа: `https://your-app.onrender.com`

## Шаг 7: Обнови фронтенд
В `index.html` найди строку:
```javascript
const API_URL = 'http://localhost:3000/api/chat';
```

Заменить на:
```javascript
const API_URL = 'https://your-app.onrender.com/api/chat';
```

И еще одну строку:
```javascript
const response = await fetch('http://localhost:3000/api/chat/new', {
```

На:
```javascript
const response = await fetch('https://your-app.onrender.com/api/chat/new', {
```

## Готово!
Теперь любой телефон сможет подключиться к твому ИИ! 📱
