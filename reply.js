//Reply command takes existing message and creates meme
//Uses message context menu (right-click menu on a message)

const Discord = require("discord.js");
require("dotenv").config()
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const getNameFromMention = require("./getNameFromMention")

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

module.exports = {
  cooldown: 10,
	data: new ContextMenuCommandBuilder()
		.setName('reply')
        .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    //If statement prevents command from being sent as slash-command
    //console.log("reply command has been issued!")
    if (interaction.isMessageContextMenuCommand() == false) 
      {
        //console.log("Interaction is not from message context menu!")
        return;
      }
    else
    {
      //console.log("Interaction is from message context menu!")
      await interaction.deferReply()
      await getNameFromMention(interaction)
    }
  }
}

//Bot token from .env file
client.login(process.env.TOKEN)