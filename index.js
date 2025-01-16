require("dotenv").config();
const {Bot, GrammyError, HttpError} = require("grammy");

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
