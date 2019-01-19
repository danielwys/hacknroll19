const Telegraf = require('telegraf')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')

var name ='';
var matric = '';

const stepHandler = new Composer()
stepHandler.action('next', (ctx) => {
  //ctx.reply('Please select the location')
  return ctx.wizard.next()
})
stepHandler.command('next', (ctx) => {
  ctx.reply('Step 2. Via command')
  return ctx.wizard.next()
})
//stepHandler.use((ctx) => ctx.replyWithMarkdown('Press `Next` button or type /next'))

const superWizard = new WizardScene('super-wizard',
  (ctx) => {
    ctx.reply('Welcome to NUS Reporting Bot! What would you like to do today?', Markup.inlineKeyboard([
      Markup.callbackButton('Report fault', 'next'),
      //Markup.callbackButton('Check', 'next')
    ]).extra())
    return ctx.wizard.next()
  },
  stepHandler,
  (ctx) => {
    ctx.reply('Please enter your name: ')
    name = ctx.from.first_name
    return ctx.wizard.next()
  },
  (ctx) => {
    ctx.reply('Please enter your matriculation number: ')
    //matric = ctx.message.text()
    return ctx.wizard.next()
  },
  (ctx) => {
    ctx.reply('Please select the location of report: ',
        Markup.keyboard([
            Markup.callbackButton("BIZ"),
            Markup.callbackButton("FASS"),
            Markup.callbackButton("COMPUTING"),
            Markup.callbackButton("MED"),
            Markup.callbackButton("SCI")            
        ]).extra()
    )
    return ctx.wizard.next()
  },
  (ctx) => {
    ctx.reply('Please attach a photo of the fault')
    return ctx.scene.leave()
  }
)

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([superWizard], { default: 'super-wizard' })
bot.use(session())
bot.use(stage.middleware())
bot.launch()
