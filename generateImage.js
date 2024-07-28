const Canvas = require("canvas")
const Discord = require("discord.js")
const { GatewayIntentBits } = require('discord.js');
const loseitButton = require("../buttons/loseitButton.js");
require("dotenv").config()

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

//Background for meme post, update template to be blank before final release
const background = "./commands/postreply/loseitphotos/loseitPostBackground.png";

//Dimensions of the canvas
const dim = {
    height: 2289,
    width: 2289,
    margin: 50
}

//Avatar size
//The x and y values are for the top left of the profile picture
const av = {
    size: 1024,
    x: 20,
    y: 420
}

const generateImage = async (loseitText, loseitUser, loseitUserName, interaction) => {

memeText = loseitText;    
memeUser = "-" + loseitUserName;

let avatarURL = loseitUser.displayAvatarURL({extension: "png", dynamic: true, size: av.size})

//Creates a canvas
    const canvas = Canvas.createCanvas(dim.width, dim.height)
    const ctx = canvas.getContext("2d")

//draw in the background
    const backimg = await Canvas.loadImage(background)
    ctx.drawImage(backimg, 0, 0)

//Declares avatar image to be that of the URL mentioned aboved in the let avatarURL" code
    const avimg = await Canvas.loadImage(avatarURL)
    ctx.save()

//See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc for documentation
    ctx.beginPath()
    ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true) //X and Y values are the center of the arc.
    ctx.closePath()
    ctx.clip()

//Draws the users profile picture 
//drawImage can have a 4th and 5th parameter for width and height respectively
    ctx.drawImage(avimg, av.x, av.y, 1024, 1024)
    ctx.restore()

var context = canvas.getContext("2d");

//aligns textBaseline so it lies in the middle of the box properly, may need to be changed later
context.textBaseline = "top";

//Base font size and type
//Note that font has to be installed on system/project folder and that naming may be different between Windows and Linux
fontSize = 250;
context.font = "250px EnduranceW01-Black";

//text style
//The alignment is relative to the x value of the fillText() method. 
//For example, if textAlign is "center", then the text's left edge will be at x - (textWidth / 2).
ctx.textAlign = "center";

//Calling textAdjust function to fix memetext and printing memetext
memeText = textAdjust("EnduranceW01-Black", 2000, 1534, memeText)
//See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText for documentation
//on context.filltext. Syntax is text, x, y, and an optional max width before text shrinking occurs
//The width of the canvas is about 1250 pixels, set fill text width it to 1300 as
//The textadjust function will create spaces as needed to avoid cutoff before compressions

//1658, 148, 1250 og values
//1665 is the sweetspot for now
context.fillText(memeText, 1665, 148, 1250);

//Resets font after memetext is filled, is smaller for the author name
context.textBaseline = "top";
fontSize = 200;
context.font = "200px EnduranceW01-Black";
ctx.textAlign = "center"

//Calling textAdjust function to fix mememauthor and printing memeauthor
memeUser = textAdjust("EnduranceW01-Black", 2500, 500, memeUser)
ctx.fillText(memeUser, 1057, 1742)

//Creates and names the attachement
const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), loseitUserName + "moment.png");
attachment.setName(loseitUserName + "moment.png")

//Edits the deferred interaction to finally respond with the attachment
await interaction.editReply({content: '', files: [attachment]})

//The interaction is fully acknowledged, now the message component is used for the button event to create a new one
//This adds the button only after the interaction reply is edited to include the image

const message = await interaction.fetchReply()
const loseitLink = await message.attachments.first().url;
//Sends over the message object, userid of the person who triggered the original command, and url of photo
await loseitButton(message, loseitLink)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//New text Adjust function for both memetext and memeauthor
//Parameters are fontface, boxwidth, and descent
//The boundaries will now be a percentage of boxwidth 20% for forced newline, 60% for replacing space with newline
function textAdjust(fontface, width, descent, s)
{
    var FINISHED = false
    var boxWidth = width
    var r = s // Reset value for s, will reset spaces when shrinking font to avoid awkward spacing
    //Loop will continue until all text is printed properly (FINISHED = true)
    while (FINISHED != true) 
    {
        for(var i = 0; i < s.length; i++)
        {          
            //Reduces available width by the width of the current character
            boxWidth -= context.measureText(s.charAt(i)).width

            //Replaces space with newline if little width remaining
            if ((boxWidth < (0.60*width)) && ((s.charAt(i) == " ")))
            {

                //Replaces current char with newline if it's a space
                //Last char is excluded in slice
                //See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
                
                s = s.slice(0, i) + "\n" + s.slice(i+1, s.length);
                boxWidth = width;
            }

            //Force adds a newline in front of character if no boxwidth remaining.
            else if((boxWidth < (0.20*width)))
            {
                s = s.slice(0, i+1) + "\n" + s.slice(i+1, s.length);
                boxWidth = width;
            }
           
            //Font shrinking is used after the newlines
            //The loop is reset so there is no awkward spacing            
            while (ctx.measureText(s).actualBoundingBoxDescent > descent)
                {
                    fontSize -= 5;
                    context.font = fontSize + "px " + fontface;
                    i = 0;
                    s = r;
                }

            //Finishes loop if string is done and after fonts have been shrunk
            if (i == (s.length - 1))
            {
                FINISHED = true;
            }
        }
    } 
    return s;
}
}

//Exports image
module.exports = generateImage

//Bot token from .env file
client.login(process.env.TOKEN)
