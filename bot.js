const mineflayer = require('mineflayer');

// Получаем IP и порт из аргументов командной строки
const ipPort = process.argv[2]; // айпи:порт
const botName = process.argv[3]; // имя бота

if (!ipPort || !botName) {
    console.error("Не указаны IP и порт или имя бота. Пример: node bot.js <ip:port> <botName>");
    process.exit(1);
}

const [ip, port] = ipPort.split(':');

// Создаем экземпляр бота
const bot = mineflayer.createBot({
    host: ip,
    port: port,
    username: botName,
    version: '1.8.9' // Версия Minecraft
});

// Обработка событий
bot.on('spawn', () => {
    console.log(`Бот ${botName} подключен к серверу ${ip}:${port}`);
});

bot.on('chat', (username, message) => {
    if (username === botName) return; // Игнорируем сообщения от самого бота

    // Обработка команды "бот скажи <текст>"
    if (message.startsWith('бот скажи ')) {
        const textToSay = message.slice(10);
        bot.chat(textToSay); // Бот отправляет сообщение в чат
    }
});

bot.on('error', (err) => {
    console.error('Ошибка:', err);
});

bot.on('end', () => {
    console.log(`Бот ${botName} отключился от сервера.`);
});
