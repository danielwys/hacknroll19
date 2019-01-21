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

// Initialise variables to be sent in report
let status = 'Submitted, Awaiting Attention'
let user_ID = ''
let user_name = ''
let user_matric = ''
let fault_photo = ''
let fault_photo_id = ''
let fault_desc = ''
let fault_loc = ''
let reportKey = ''
let corrector = ''
let reviewer_first = true

//will someone explain to me what composer does (should be decide when to move to next step)
const stepHandler = new Composer()
stepHandler.action('next', (ctx) => { //2
    // assignment oprs at every block to store data
    user_ID = ctx.from.id
    ctx.reply('Starting a new report! Please enter your fullname: ')
    return ctx.wizard.next()
})

// WizardScene helps to 'pause' and wait for user input (i think)
const superWizard = new WizardScene('super-wizard',
    //when bot first starts
    (ctx) => { //1
        ctx.reply('Hello! I am NUS Reporting Bot! How can I help you today?',
            Markup.inlineKeyboard([
                Markup.callbackButton('Report fault', 'next'),
            ]).extra())
        return ctx.wizard.next()
    },
    stepHandler,
    (ctx) => { //3
        user_name = ctx.message.text
        ctx.reply('Hello ' + user_name + '! Please enter your matriculation number: ')
        return ctx.wizard.next()
    },
    (ctx) => { //4
        user_matric = ctx.message.text
        ctx.reply('Thanks! Could you please send me a photo of the fault?')
        return ctx.wizard.next()
    },
    function photo_acceptor(ctx) { //checks photo
        try { //Try and catch here to prevent error when user sends non-photo message //BUT HOW TO MAKE IT LOOP BACK TO THE START
            fault_photo = ctx.message.photo.pop().file_id
            fault_photo_id = (ctx.message.photo.pop()['file_id'])
        } catch (err) {
            ctx.reply('That is not a photo! Please try again!')
            return ctx.wizard.selectStep(4) // Loops in the same
        }
        ctx.reply('Fault photo saved! Thank you! Could you please describe the fault to me?')
        return ctx.wizard.next()
    },
    (ctx) => { //6
        fault_desc = ctx.message.text
        ctx.reply('Oh no, that sounds bad! Could you let me know where the fault is located at?',
            Markup.keyboard(["BIZ", "COMPUTING", "FASS", "MED", "SCI", "UTOWN"]).oneTime().resize().extra()
        )
        return ctx.wizard.next()
    },
    function reviewer(ctx) { //7
        if (reviewer_first) {
            fault_loc = ctx.message.text
        }
        reviewer_first = false
        ctx.replyWithPhoto(fault_photo, {
            caption: "Alright! Could you verify that all the details are correct?: \n\n" +
                "Name: " + user_name + "\n" +
                "Matriculation number: " + user_matric + "\n" +
                "Location: " + fault_loc + "\n" +
                "Description: " + fault_desc + "\n\n" +
                "Please select Yes if correct and No if not."
        })
        ctx.reply('.', Markup.keyboard([ //ADDING THE 'TEST' MAKES THE KEYBOARD WORK. IT IS NOT PRINTED OUT, BUT REMOVING IT BREAKS THE KEYBOARD
            Markup.callbackButton("Yes"),
            Markup.callbackButton("No")
        ]).oneTime().resize().extra())
        return ctx.wizard.next()
    },
    (ctx) => { //8
        let answer = ctx.message.text.toLowerCase() //Prompt user to review the report and respond with 'yes' or 'no'
        if (answer == "no") { //8a
            ctx.reply('Okay! Which part did you get wrong?',
                Markup.keyboard(["Fullname", "Matric No.", "Photo", "Fault Description", "Fault Location"]).oneTime().resize().extra())
            return ctx.wizard.next()
        } else if (answer == "yes") { //8b
            ctx.reply("Upload successful! Thank you for the report!")
            // sends the data to firebase
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
            reportKey = report.key;
            status = 'Submitted, Awaiting Attention'
            user_ID = ''
            user_name = ''
            user_matric = ''
            fault_photo = ''
            fault_photo_id = ''
            fault_desc = ''
            fault_loc = ''
            reportKey = ''
            corrector = ''
            reviewer_first = true
            return ctx.scene.leave()
        }
    },
    function editor_sayer(ctx) {
        corrector = ctx.message.text
        ctx.reply('Alright! Go ahead and send me the correct ' + ctx.message.text + '!')
        return ctx.wizard.next()
    },
    function editor_doer(ctx) {
        switch (corrector) {
            case "Fullname":
                user_name = ctx.message.text
                break
            case "Matric No.":
                user_matric = ctx.message.text
                break
            case "Photo": //NO ERROR CATCHER
                fault_photo = ctx.message.photo.pop().file_id
                fault_photo_id = (ctx.message.photo.pop()['file_id'])
                break
            case "Fault Description":
                fault_desc = ctx.message.text
                break
            case "Fault Location": //USER HAS TO INPUT TEXT INSTEAD OF PREDEFINED LOCATIONS
                fault_loc = ctx.message.text
                break
        }
        ctx.reply('Type "Continue" to proceed')
        return ctx.wizard.selectStep(6) //NEED TO PRESS ONE MORE RANDOM COMMAND TO REACH REVIEW
    }
)

// Initialising the bot and middlewares used
const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([superWizard], {
    default: 'super-wizard'
})

bot.use(session())
bot.use(stage.middleware())
bot.launch()