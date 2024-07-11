const Canvas = require("canvas")
const Discord = require("discord.js")
const { AttachmentBuilder, Client, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config()

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

//Background for meme post, update template to be blank before final release
const background = './commands/loseitpost/loseitphotos/loseitPostBackground.png';

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
//console.log("Received message is " + loseitText);
//console.log("Received user is " + loseitUser);
//console.log("Received username is " + loseitUserName);

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
fontSize = 250;
context.font = "250px EnduranceW01";

//text style
ctx.fillStyle = "black"
ctx.textAlign = "center"

//Calling textAdjust function to fix memetext and printing memetext
memeText = textAdjust("EnduranceW01-Black", 2000, 1534, memeText)
context.fillText(memeText, 1658, 148, 1200);

//Resets font after text is filled
context.textBaseline = "top";
fontSize = 300;
context.font = "300px EnduranceW01";
ctx.fillStyle = "black"
ctx.textAlign = "center"

//Calling textAdjust function to fix mememauthor and printing memeauthor
memeUser = textAdjust("EnduranceW01-Black", 2500, 500, memeUser)
ctx.fillText(memeUser, 1057, 1742)

    //Creates and names the attachement
    const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), loseitUserName + "moment.png");
    attachment.setName(loseitUserName + "moment.png")
    console.log("Returning image!")

    //Edits the deferred interaction to finally respond with the attachment
    await interaction.editReply({files: [attachment]})


//New text Adjust function for both memetext and memeauthor
//Parameters are fontface, boxwidth, and descent
//The boundaries will now be a percentage of boxwidth 15% for forced newline, 55% for replacing space with newline
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
            //console.log("Remaining boxwidth is: " + boxWidth)

            //Replaces space with newline if little width remaining
            if ((boxWidth < (0.55*width)) && ((s.charAt(i) == " ")))
            {

                //Replaces current char with newline if it's a space
                //Last char is excluded in slice
                //See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
                
                s = s.slice(0, i) + "\n" + s.slice(i+1, s.length);
                boxWidth = width;
                //Debugging
                //console.log("Current char is space, turned newline at char " + i);     
            }

            //Force adds a newline in front of character if no boxwidth remaining.
            else if((boxWidth < (0.15*width)))
            {
                s = s.slice(0, i+1) + "\n" + s.slice(i+1, s.length);
                //Debugging
                //console.log("Newline forcefully added after char " + i);
                //Debugging
                boxWidth = width;
            }
           
            //Font shrinking is used after the newlines
            //The loop is reset so there is no awkward spacing            
            while (ctx.measureText(s).actualBoundingBoxDescent > descent)
                {
                    //Debugging
                    //console.log("fontsize is " + fontSize);
                    fontSize -= 5;
                    //console.log("Fontsize is: " + fontSize)
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