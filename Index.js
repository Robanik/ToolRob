const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

// Ваш токен
const token = '7887322055:AAEWIfkhgVgC67_utwm7MlE7dt0InKfYW8g';
const bot = new TelegramBot(token, { polling: true });

let minecraftBot;

// Функция для запуска Minecraft бота
function startMinecraftBot(ipPort, botName) {
    minecraftBot = exec(`node bot.js ${ipPort} ${botName}`);

    minecraftBot.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    minecraftBot.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    minecraftBot.on('close', (code) => {
        console.log(`Minecraft bot exited with code ${code}`);
        minecraftBot = null; // сбрасываем ссылку на бота
    });
}

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Создать бота', callback_data: 'create_bot' }],
                [{ text: 'Credits', callback_data: 'show_credits' }]
            ],
        },
    };
    bot.sendMessage(chatId, 'Нажмите кнопку, чтобы создать бота или узнать о кредите:', options);
});

// Обработка нажатия на кнопку "Создать бота"
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;

    if (callbackQuery.data === 'create_bot') {
        bot.answerCallbackQuery(callbackQuery.id); // Ответ на запрос
        bot.sendMessage(chatId, 'Введите айпи:порт', {
            reply_markup: {
                force_reply: true
            }
        }).then(() => {
            bot.once('message', (reply) => {
                const ipPort = reply.text;

                bot.sendMessage(chatId, 'Введите имя бота', {
                    reply_markup: {
                        force_reply: true
                    }
                }).then(() => {
                    bot.once('message', (reply) => {
                        const botName = reply.text;
                        startMinecraftBot(ipPort, botName);
                        bot.sendMessage(chatId, `Бот ${botName} запущен на ${ipPort}`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Выйти', callback_data: 'exit_bot' }]
                                ]
                            }
                        });
                    });
                });
            });
        });
    }

    // Обработка нажатия на кнопку "Credits"
    if (callbackQuery.data === 'show_credits') {
        bot.answerCallbackQuery(callbackQuery.id); // Ответ на запрос
        const creditsMessage = "(By Robanik) (assistant: ALRomik, ...$...?...@... ,...)";
        bot.sendMessage(chatId, creditsMessage);
    }

    // Обработка нажатия на кнопку "Выйти"
    if (callbackQuery.data === 'exit_bot') {
        if (minecraftBot) {
            minecraftBot.kill();
            bot.sendMessage(chatId, 'Бот Minecraft остановлен.');
        } else {
            bot.sendMessage(chatId, 'Бот Minecraft не запущен.');
        }
    }
});
