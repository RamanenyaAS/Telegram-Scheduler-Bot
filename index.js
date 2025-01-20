require("dotenv").config();
const { Bot, GrammyError, HttpError } = require("grammy");

const tasks = [];
const reminders = [];
const userStates = {}; // Хранилище состояний пользователей

const bot = new Bot(process.env.BOT_API_KEY);

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запустить бота",
  },
  {
    command: "help",
    description: "Показать список команд",
  },
  {
    command: "addtask",
    description: "Добавить задачу",
  },
  {
    command: "tasks",
    description: "Посмотреть список задач",
  },
  {
    command: "deltask",
    description: "Удалить задачу",
  },
  {
    command: "cleartasks",
    description: "Очистить все задачи",
  },
  {
    command: "setreminder",
    description: "Установить напоминание",
  },
  {
    command: "edittask",
    description: "Изменить текст задачи",
  },
  {
    command: "donetask",
    description: "Отметить задачу как выполненную",
  },
]);

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Привет! Я твой бот-планировщик. Вот, что я могу:\n" +
      "/help — показать все команды\n" +
      "/addtask — добавить задачу\n" +
      "/tasks — посмотреть список задач\n" +
      "/deltask — удалить задачу"
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Список доступных команд:\n" +
      "/start — приветственное сообщение\n" +
      "/help — показать этот список\n" +
      "/addtask — добавить задачу\n" +
      "/tasks — посмотреть список задач\n" +
      "/deltask — удалить задачу\n" +
      "/cleartasks — очистить все задачи\n" +
      "/setreminder — установить напоминание\n" +
      "/edittask — изменить текст задачи\n" +
      "/donetask — отметить задачу как выполненную\n"
  );
});

bot.command("addtask", async (ctx) => {
  userStates[ctx.chat.id] = { state: "waiting_for_task_text" }; // Устанавливаем состояние
  await ctx.reply("Введите текст задачи следующим сообщением.");
});

bot.command("tasks", async (ctx) => {
  if (tasks.length === 0) {
    return await ctx.reply("Список задач пуст.");
  }
  const taskList = tasks
    .map((task) => `${task.id}. ${task.text} [${task.done ? "✅" : "❌"}]`)
    .join("\n");
  await ctx.reply(`Ваши задачи:\n${taskList}`);
});

bot.command("deltask", async (ctx) => {
  userStates[ctx.chat.id] = { state: "waiting_for_task_id_for_del" };
  await ctx.reply("Введите ID задачи, которую вы хотите удалить.");
});

bot.command("cleartasks", async (ctx) => {
  delete userStates[ctx.chat.id];
  tasks.length = 0;
  await ctx.reply("Список задач очищен.");
});

bot.command("edittask", async (ctx) => {
  userStates[ctx.chat.id] = { state: "waiting_for_task_id_for_edit" };
  await ctx.reply("Введите ID задачи, которую вы хотите отредактировать.");
});

bot.command("donetask", async (ctx) => {
  userStates[ctx.chat.id] = { state: "waiting_for_task_id_for_done" };
  await ctx.reply("Введите ID задачи, которую вы хотите отметить выполненной.");
});

bot.command("setreminder", async (ctx) => {
  userStates[ctx.chat.id] = { state: "waiting_for_reminder_time" };
  await ctx.reply(
    "Введите время напоминания в формате YYYY-MM-DD HH:MM и текст задачи через запятую.\n" +
      "Пример: 2025-01-17 15:30, Позвонить врачу"
  );
});

// Обработчик сообщений для состояний пользователя
bot.on("message", async (ctx) => {
  if (ctx.message.text.startsWith("/")) {
    return;
  }

  const state = userStates[ctx.chat.id]; // Получаем текущее состояние пользователя

  // Обработка команды добавления задачи
  if (state && state.state === "waiting_for_task_text") {
    const text = ctx.message.text;
    const id = tasks.length + 1;
    tasks.push({ id, text, done: false });

    await ctx.reply(`Задача добавлена: "${text}" (ID: ${id})`);
    delete userStates[ctx.chat.id]; // Сбрасываем состояние
    return;
  }

  // Обработка команды удаления задачи
  if (state && state.state === "waiting_for_task_id_for_del") {
    const id = parseInt(ctx.message.text, 10);

    if (!id || !tasks.find((task) => task.id === id)) {
      await ctx.reply("Задача с таким ID не найдена. Попробуйте снова.");
      return;
    }

    tasks.splice(tasks.findIndex((task) => task.id === id), 1);
    tasks.forEach((task, index) => {
      task.id = index + 1;
    });

    await ctx.reply(`Задача с ID: ${id} удалена. ID задач обновлены.`);
    delete userStates[ctx.chat.id];
    return;
  }

  // Обработка редактирования задачи
  if (state && state.state === "waiting_for_task_id_for_edit") {
    const id = parseInt(ctx.message.text, 10);
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      await ctx.reply("Задача с таким ID не найдена. Попробуйте снова.");
      return;
    }

    // Сохраняем ID задачи в состояние для последующего редактирования
    userStates[ctx.chat.id] = { state: "waiting_for_new_task_text", taskId: id };
    await ctx.reply(`Задача с ID ${id} найдена. Введите новый текст для задачи.`);
    return;
  }

  // Обработка нового текста задачи для редактирования
  if (state && state.state === "waiting_for_new_task_text") {
    const newText = ctx.message.text;
    const taskId = state.taskId; // Получаем ID задачи из состояния
    const task = tasks.find((task) => task.id === taskId);

    if (task) {
      task.text = newText; // Обновляем текст задачи
      await ctx.reply(`Задача с ID ${task.id} успешно отредактирована. Новый текст: "${newText}"`);
    }

    delete userStates[ctx.chat.id];
    return;
  }

  if (state && state.state === "waiting_for_task_id_for_done") {
    const id = parseInt(ctx.message.text, 10);
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      await ctx.reply("Задача с таким ID не найдена. Попробуйте снова.");
      return;
    }

    task.done = true;
    await ctx.reply(`Задача с ID ${id} помечена как выполненная.`);
    delete userStates[ctx.chat.id];
    return;
  }
  if (state && state.state === "waiting_for_reminder_time") {
    const input = ctx.message.text.split(",");
    if (input.length < 2) {
      await ctx.reply("Неверный формат. Попробуйте снова.");
      return;
    }

    const reminderTime = new Date(input[0].trim());
    const reminderText = input[1].trim();

    if (isNaN(reminderTime.getTime())) {
      await ctx.reply("Неверный формат времени. Попробуйте снова.");
      return;
    }

    const timeUntilReminder = reminderTime - new Date();
    if (timeUntilReminder <= 0) {
      await ctx.reply("Указанное время уже прошло. Попробуйте снова.");
      return;
    }

    reminders.push({
      chatId: ctx.chat.id,
      text: reminderText,
      time: reminderTime,
    });

    setTimeout(async () => {
      await ctx.reply(`Напоминание: "${reminderText}"`);
    }, timeUntilReminder);

    await ctx.reply(
      `Напоминание установлено на ${reminderTime.toLocaleString()}: "${reminderText}"`
    );
    delete userStates[ctx.chat.id];
    return;
  }

  await ctx.reply(
    "Я не понимаю, что вы хотите сделать.\n" +
      "/help — узнать список доступных команд.\n"
  );
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.log(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
