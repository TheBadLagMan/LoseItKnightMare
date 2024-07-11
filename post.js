/*
post command to create a meme post.
Interaction is forwarded to getNameFromMention.js
to convert author id/ping to username and pfp
*/ 

const Discord = require("discord.js");
require("dotenv").config()
const { SlashCommandBuilder } = require('discord.js');
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
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('Turn a quote into a meme [UserID/Ping] [Memetext] [Name if different from Discord name]')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Ping the quoted user or type their user id. Determines name and pfp')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('memetext')
                .setDescription('This is the quoted text, the one you are making a meme out of')
                .setRequired(true))
        .addStringOption(option => 
              option.setName('manualauthorname')
                .setDescription('You can manually change the author name to be different from their Discord name (OPTIONAL)')
                .setRequired(false)),        

  async execute(interaction) {
    //Post and reply commands are deferred to allow for > 3 second response time
    //console.log("Post command has been used!")
    await interaction.deferReply()
    await getNameFromMention(interaction)
  }
}

//Bot token from .env file
client.login(process.env.TOKEN)