let { Client } = require('discord.js');
let auth = require('./auth.json');
let Twitter = require('./twitter.js');
let Commands = require('./commands/declarations.js');
let Inline = require('./commands/inlineDeclarations.js');
let Custom = require('./commands/customFunctions.js');

let prefix = (!auth.testBot ? "!" : "~");

// Initialize Discord Bot
let bot = new Client();

bot.on('ready', () => {
  console.log(`Connected as: %s`, bot.user.tag);
  console.log("Connecting to Twitter...");
  Twitter.requestBearerToken();
});

bot.on('message', message => {
  // Commands for the Bot start with !, if our message does not start with ! then we don't need to check for command matches.
  // However, we do have some inline commands (++, --, etc.) so we will need to check for that.
  if(message.content.substring(0,1) === prefix) {
    let command = message.content.substring(1).split(" ")[0].toLowerCase(),
        params = message.content.split(" ").slice(1),
        commandFound = false;
    for(let i = 0; i < Commands.length; i++) {
      let cmd = Commands[i];
      commandFound = (cmd.command == command);
      if(commandFound) {
        // Our command matches, run the action. Check to see if it accepts parameters, or if the user requested !list
        cmd.action(message,(cmd.hasParams ? params : (cmd.command === "list" ? { "inline": Inline, "commands": Commands } : "")));
        break;
      }
    }

    // No hard coded command was found, try to excute a custom command.
    // If none are found, this method will have Mr.Mackey respond with a no command found message.
    if(!commandFound) { Custom.executeCustomCommand(message,command); }
  } else {
    // Our message does not start with !, so it isn't a basic command or custom command.
    // We should check to see if there are any inline commands. (For now... break out of the for loop after the first inline command is found)
    for(let i = 0; i < Inline.length; i++) {
      if(message.content.includes(Inline[i].command)) {
        Inline[i].action(message);
        break;
      }
    }
  }
});

bot.login(auth.token);