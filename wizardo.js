const Telegraf = require('telegraf')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
const fs = require('fs');
const download = require('download');

var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hacknroll19.firebaseio.com"
});

var db = admin.database();
var reportRef = db.ref("reports");

// Program Starts Here

var name ='';
var matric = '';
var loc = '';
var desc = '';

const stepHandler = new Composer()
stepHandler.action('next', (ctx) => {
  return ctx.wizard.next()
})

const superWizard = new WizardScene('super-wizard',
  (ctx) => {
    ctx.reply('Welcome to NUS Reporting Bot! What would you like to do today?', Markup.inlineKeyboard([
      Markup.callbackButton('Report fault', 'next'),
    ]).extra())
    return ctx.wizard.next()
  },
  stepHandler,
  (ctx) => {
    ctx.reply('Please enter your fullname: ')
    return ctx.wizard.next()
  },
  (ctx) => {
    name = ctx.message.text
    ctx.reply('Please enter your matriculation number: ')
    return ctx.wizard.next()
  },
  (ctx) => {
    matric = ctx.message.text
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
    loc = ctx.message.text
    ctx.reply('Please enter some details regarding the location, as well as a short description on what is wrong: ')
    return ctx.wizard.next()
  },
  (ctx) => {
    desc = ctx.message.text
    ctx.reply('Please attach a photo of the fault')
    return ctx.wizard.next()
  },
  (ctx) => {
    ctx.reply(("Please check the details: \n" +
              "Name: " + name + "\n" +
              "Matriculation number: " + matric + "\n" +
              "Location: " + loc + "\n" +
              "Description: " + desc),
          Markup.keyboard([
              Markup.callbackButton("Yes"),
              Markup.callbackButton("No")
          ]).extra()
    )
    return ctx.wizard.next()
  },
  (ctx) => {
      ctx.reply("Thank you for the report.")
      var report = reportRef.push({
        name: [name],
        matric: [matric],
        loc: [loc],
        desc: [desc]
      });
    return ctx.scene.leave()
  }
)

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([superWizard], { default: 'super-wizard' })

bot.use(session())
bot.use(stage.middleware())
bot.launch()
