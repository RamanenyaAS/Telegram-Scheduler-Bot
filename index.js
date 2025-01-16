require("dotenv").config();
const {Bot, GrammyError, HttpError} = require("grammy");
const tasks = [];

const bot = new Bot (process.env.BOT_API_KEY);

bot.api.setMyCommands([
  {
    command: "start",
    description:"Запустить бота",
  },
  {
    command:"help",
    description: "Показать список команд",
  },
  {
    command:"addtask",
    description: "Добавить задачу",
  },
  {
    command:"tasks",
    description: "Посмотреть список задач",
  },
  {
    command:"deltask",
    description: "Удалить задачу",
  },
  {
    command:"cleartasks",
    description: "очистить все задачи",
  },
  {
    command:"setreminder",
    description: "установить напоминание",
  },
  {
    command:"edittask",
    description: "изменить текст задачи",
  },
  {
    command:"donetask",
    description: "отметить задачу как выполненную",
  },
  {
    command:"overdue",
    description: "показать просроченные задачи",
  },
]);

bot.command("start", async(ctx) =>{
  await ctx.reply("Привет! Я твой бот-планировщик. Вот, что я могу:\n" +
    "/help — показать все команды\n" +
    "/addtask <текст задачи> — добавить задачу\n" +
    "/tasks — посмотреть список задач\n" +
    "/deltask <ID> — удалить задачу по ID");
});

bot.command("help", async (ctx) => {
  await ctx.reply("Список доступных команд:\n" +
    "/start — приветственное сообщение\n" +
    "/help — показать этот список\n" +
    "/addtask <текст задачи> — добавить задачу\n" +
    "/tasks — посмотреть список задач\n" +
    "/deltask <ID> — удалить задачу\n" +
    "/cleartasks — очистить все задачи\n" +
    "/setreminder <ID> <время> — установить напоминание\n" +
    "/edittask <ID> <новый текст> — изменить текст задачи\n" +
    "/donetask <ID> — отметить задачу как выполненную\n" +
    "/overdue — показать просроченные задачи");
});

bot.command("addtask", async(ctx) =>{
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text){
    return await ctx.reply("Укажите текст задачи после команды.");
  }

  const id = tasks.length + 1;
  tasks.push({id,text, done:false, reminder: null});
  await ctx.reply(`Задача добавлена: "${text}" (ID: ${id})`);
})

bot.command("tasks", async (ctx) =>{
  if (tasks.length === 0){
    return await ctx.reply("Список задач пуст.");
  }
  const taskList = tasks.map((task) => `${task.id}. ${task.text} [${task.done ? "✔" : "❌"}]`).join("\n");
  await ctx.reply(`Ваши задачи:\n${taskList}`);
});

bot.command("deltask", async (ctx) =>{
  const id = parseInt(ctx.message.text.split(" ")[1],10);
  if (!id || !tasks.find((task) => task.id === id)){
    return await ctx.reply("Задача с таким ID не найдена.");
  };
  tasks.splice(tasks.findIndex((task) => task.id === id), 1);
  await ctx.reply(`Задача с ID: ${id} удалена.`)
})

bot.catch((err) =>{
  const ctx = err.ctx;
  console.log(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if ( e instanceof GrammyError){
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError){
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
