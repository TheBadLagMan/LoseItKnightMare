/*
getNameFromMention replaces pings with names, and determines the author and name used for the meme.
User pings, channel pings, and role pings are all replaced with their names
message.cleancontent is not used as it does not remove the ping signs (#, @)
*/

const Discord = require("discord.js")
require("dotenv").config()
const generateImage = require("./generateImage")

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

const getNameFromMention = async (interaction) => {
    //console.log("Beggining getNameFromMention.js!")
    var loseitUser;
    var loseitUsername;
    var loseitText;
   
    //Checks if command is the reply command from context menu, otherwise checks for parameters from /post options
    if(interaction.isMessageContextMenuCommand())
    {
        try 
        {
            loseitUser = interaction.targetMessage.author
            //console.log("User is: " + loseitUser)
            loseitUsername = interaction.targetMessage.author.displayName
            //console.log("Username is: " + loseitUsername)
            loseitText = interaction.targetMessage.content 
            //console.log("Text is: " + loseitText.toString())

            if (loseitText.length == (0 | undefined || null || "" | " "))
                {
                    //Error is forcefully thrown if no text is detected
                    throw (error)
                }
        } 
        
        //Error message is given and then deleted so new command can be issued without missing text
        catch (error) 
        {
            await interaction.editReply({content:"ERROR! **reply command can only be used on user messages that have text!**"})
            setTimeout(() => interaction.deleteReply(), 5000);            
            return
        }
    }

    else
    {
    //Trys to fetch Discord user from author field
        try 
        {
            author = interaction.options.getString('author')
            //console.log("Author field content: " + author)
            //REGEX to ensure only user id digits are taken from author field for easy fetching
            author = author.replace(/\D/g, '')
            loseitUser = await client.users.fetch(author)
            loseitUsername = loseitUser.displayName
            //console.log("Current loseitUser: " + loseitUser)
        }

        catch (error) 
        //If author is not specified (no proper ping/id) use message poster as author
        {
            //console.log("No user found! Defaulting to message poster!")
            //console.log("Interaction member is: " + interaction.member)
            loseitUser = await client.users.fetch(interaction.member);
            //console.log("loseitUser is: " + loseitUser);
            loseitUsername = loseitUser.displayName;
            //console.log("loseitUsername is: " + loseitUsername)
        }

        //If there is a manual author name written, that name will be used instead
        //The userdata is unaffected to ensure pfp is still retained.

        let manualauthorname = interaction.options.getString('manualauthorname')
        //console.log("This is the manualauthorname: " + manualauthorname)

        if(((manualauthorname != '') && (manualauthorname != ' ') && (manualauthorname != null) && (manualauthorname != undefined))) 
        {
            try
            {
                //console.log("Valid manual author name was found!")
                loseitUsername = manualauthorname
            }

        catch (error)
            {   
                //console.log("No manual author found! Using previous author!")
            }
        } 
     
        //Takes memetext from slash command
        loseitText = interaction.options.getString('memetext')
    }

        //If there is no text somehow, this trycatch will cancel the function
        try 
        {
            if((loseitText == '') || (loseitText == ' ') || (loseitText == null) || (loseitText == undefined))
            {
                throw (error)
            }
        } 
        catch (error) 
        {
            await interaction.editReply({content:"ERROR! **reply command can only be used on user messages that have text!**"})
            setTimeout(() => interaction.deleteReply(), 5000);            
            return
        }
   

    //Calls function to replace all mentions in lucid text with appropriate names
    replaceNameFromMention(loseitText)
    loseitText = loseitText.trim() 
    
    //console.log("getNameFromMention.js complete!")
    //console.log("Starting generateImage.js")
    
    //Sends over text, userdata of author, username of author, and interaction data to generateImage.
    await generateImage(loseitText, loseitUser, loseitUsername, interaction)
}

//Replaces mentions in memetext with proper names regardless of /post or reply command usage
async function replaceNameFromMention(loseitText)
{
    //Label for outer loop. Used to break outerloop when no ping characters are detected
    outer_loop:

    //Code to replace userids with usernames
    for (let i = 0; i < loseitText.length; i++)
    {
        //If ping characters present, check for user ping
        
        if (loseitText.includes('<@') && loseitText.includes('>')) 
        {
            //console.log("User Ping characters are present!")
            userId = loseitText.slice((loseitText.indexOf('@') + 1), loseitText.indexOf('>'))
            //console.log("Pinged Userid is: " + userId)
            try 
            {
                usernameReplace = (await client.users.fetch(userId)).displayName
                mentionReplace = loseitText.slice((loseitText.indexOf('<')), (loseitText.indexOf('>') + 1))
                loseitText = loseitText.replace(mentionReplace, usernameReplace)
                //console.log("User ping has been replaced, new string is: " + loseitText)
                i += usernameReplace.length
                //console.log("Current i value is: " + i)
                matches.push(userId)
                //console.log("Pinged users are: " + matches)
            } 

            //If no proper pings are found.
            catch (error) 
            {
                //console.log("Unable to find user from API! Attempting channel mention search!")
            } 
        }

        //Now check for channel mentions
        if ((loseitText.includes('<#')) && (loseitText.includes('>')))
        {
            try 
            {
                //console.log("# sign is present, checking for channel mention!")
                channelId = loseitText.slice((loseitText.indexOf('#') + 1), loseitText.indexOf('>'))

                channelReplace = (await client.channels.fetch(channelId)).name
                //console.log("Channel Fetch was successful, channel name is: " + channelReplace)
                mentionReplace = loseitText.slice((loseitText.indexOf('<')), (loseitText.indexOf('>') + 1))

                //Work on this?
                loseitText = loseitText.replace(mentionReplace, channelReplace)
                //console.log("Channel ping has been replaced, new string is: " + loseitText)
                i += channelReplace.length
                //console.log("Current i value is: " + i)
                matches.push(channelId)
                //console.log("Pinged channels are: " + matches)
            } 

            //If no proper pings are found.
            catch (error) 
            {
                //console.log("No channels found! Checking for role mentions!")
            }           
        }

       //Checking for role mentions
       if ((loseitText.includes('<@&')) && (loseitText.includes('>')))
        {
            try 
            {
                //console.log("<@& sign is present, checking for role mention!")
                roleId = loseitText.slice((loseitText.indexOf('&') + 1), loseitText.indexOf('>'))

                roleReplace = (await interaction.guild.roles.fetch(roleId)).name
                //console.log("Role Fetch was successful, role name is: " + roleReplace)
                mentionReplace = loseitText.slice((loseitText.indexOf('<')), (loseitText.indexOf('>') + 1))

                loseitText = loseitText.replace(mentionReplace, roleReplace)
                //console.log("Role mention has been replaced, new string is: " + loseitText)
                i += roleReplace.length
                //console.log("Current i value is: " + i)
                matches.push(roleId)
                //console.log("Pinged roles are: " + matches)
            } 

            //If no proper pings are found.
            catch (error) 
            {
                //console.log("No roles found!")
            }           
        } 
    }
    return loseitText
}

//Exports current file
module.exports = getNameFromMention
//Bot token from .env file
client.login(process.env.TOKEN)