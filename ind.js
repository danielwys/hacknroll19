const Telegraf = require("telegraf");
const Mark = require("telegraf/markup");
const Stage = require("telegraf/stage");
const Session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");


const bot = new Telegraf(process.env.BOT_TOKEN);

var name = '';
var matric = '';

// bot.start(ctx => {
//     name = ctx.message.text;
//     return ctx.reply(
//         ("Welcome to NUS Reporting Bot, " + ctx.from.first_name + "!",
//         "Please input your name:  \nPlease press Next when you are done."),
//         Mark
//         .keyboard(["Next"])
//         .resize()
//         .extra()
//     );
// });

bot.start(ctx => {
    return ctx.reply(
        ("Welcome to NUS Reporting Bot! What would you like to do?",
        Mark.inlineKeyboard([
            Mark.callbackButton("Report fault", "REPORT"),
            Mark.callbackButton("Check existing fault", "CHECK")
         ])
        // .oneTime()
        // .resize()
        .extra())
    );
})

//User chooses "Report fault"
//Retriving name
bot.hears('Report fault', ctx => {
    ctx.reply("Please input your name: \nPlease press Next when you are done.",
        Mark
        .keyboard(["Next"])
        .resize()
        .extra()
        ),
    name = ctx.message.text}
);

//Retriving matric number
bot.hears('Next', ctx => {
    ctx.reply("Please input your matriculation number: \nPlease press Next when you are done.",
    Mark
    .keyboard(["Next_"])
    .resize()
    .extra()
    ),
    matric = ctx.message.text
    }
);

// bot.hears('Next', ({ reply }) =>
//     reply('What would you like to do?', 
//     Mark
//     .keyboard(["/Report fault", "/Check existing fault"])
//     .oneTime()
//     .resize()
//     .extra()
//     )
// );

//User presses on "Report fault" button --> choose location
bot.command("Next_", (ctx) => {
    return ctx.reply(name + ', Please select the location of report',
        Mark.keyboard([
            Mark.callbackButton("BIZ"),
            Mark.callbackButton("FASS"),
            Mark.callbackButton("COMPUTING"),
            Mark.callbackButton("MED"),
            Mark.callbackButton("SCI")
        ]).extra()
        )}
);


//After pressing, going back to the menu
// bot.action("BACK", ctx => {
//     ctx.reply("Fault reported.");
//     ctx.reply("Is there anything else to report?"),
//     Markup.inlineKeyboard([
//         Mark.callbackButton("Report fault", "REPORT"),
//         Mark.callbackButton("Check existing fault", "CHECK")
//     ]).extra()
// })

// const reporter = new WizardScene(
//     "reporter",
//     ctx => {
//         ctx.reply("Please select venue of your report",
//         Mark.inlineKeyboard([
//             Mark.callbackButton("BIZ"),
//             Mark.callbackButton("FASS"),
//             Mark.callbackButton("COMPUTING"),
//             Mark.callbackButton("MED"),
//             Mark.callbackButton("SCI")
//         ]).extra()
//         )}
// );


bot.launch();


