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
var storage = admin.storage();
var reportRef = db.ref("reports");

// Program Starts Here

let status = 'Submitted, Awaiting Attention'
let user_ID = ''
let user_name = ''
let user_matric = ''
let fault_photo = ''
let fault_photo_id = ''
let fault_desc = ''
let fault_loc = ''

//will someone explain to me what composer does (should be decide when to move to next step)
const stepHandler = new Composer()
stepHandler.action('next', (ctx) => {
  return ctx.wizard.next()
})

const superWizard = new WizardScene('super-wizard',
  //when bot first starts
  (ctx) => {
    ctx.reply('Hello! I am NUS Reporting Bot! How can I help you today?', Markup.inlineKeyboard([
      Markup.callbackButton('Report fault', 'next'),
    ]).extra())
    return ctx.wizard.next()
  },
  stepHandler,
  (ctx) => {
    // assignment oprs at every block to store data
    user_ID = ctx.from.id
    ctx.reply('Starting a new report! Please enter your fullname: ')
    return ctx.wizard.next()
  },
  (ctx) => {
    user_name = ctx.message.text
    ctx.reply('Hello ' + user_name + '! Please enter your matriculation number: ')
    return ctx.wizard.next()
  },
  (ctx) => {
    user_matric = ctx.message.text
    ctx.reply('Thanks! Could you please send me a photo of the fault?')
    return ctx.wizard.next()
  },
  (ctx) => {
    fault_photo = ctx.message.photo.pop().file_id
    fault_photo_id = (ctx.message.photo.pop()['file_id'])
    ctx.reply('Fault photo saved! Thank you! Could you please describe the fault to me?')
    return ctx.wizard.next()
  },
  (ctx) => {
    fault_desc = ctx.message.text
    ctx.reply('Oh no, that sounds bad! Could you let me know where the fault is located at?',
        Markup.keyboard([ //Need to add more locations
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
    fault_loc = ctx.message.text
    ctx.replyWithPhoto(fault_photo,
    {caption: "Alright! Could you verify that all the details are correct?: \n" +
              "Name: " + user_name + "\n" +
              "Matriculation number: " + user_matric + "\n" +
              "Location: " + fault_loc + "\n" +
              "Description: " + fault_desc},
          Markup.keyboard([ //Need to find way to edit if wrong
              Markup.callbackButton("Yes"),
              Markup.callbackButton("No")
          ]).extra()
    )
    return ctx.wizard.next()
  },
  (ctx) => {
      ctx.reply("Upload successful! Thank you for the report!")
      var report = reportRef.push({
        status: [status],
        user_ID: [user_ID],
        user_name: [user_name],
        user_matric: [user_matric],
        fault_photo: [fault_photo],
        fault_photo_id: [fault_photo_id],
        fault_desc: [fault_desc],
        fault_loc: [fault_loc]
      });
    return ctx.scene.leave()
  }
)

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([superWizard], { default: 'super-wizard' })

bot.use(session())
bot.use(stage.middleware())
bot.launch()
