const fs = require('node:fs');
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');
const Database = require("@replit/database");
const db = new Database();
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const express = require("express");
const app = express();
app.listen(3000), () => {
  console.log("express is running!")
}
app.get("/", (req, res) => {
  res.send("hello world!")
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}


/*client.on(Events.InteractionCreate, async interaction => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  lb = await db.get('lb');
  console.log (lb)
  updateScoreboard(lb);
})



async function updateScoreboard(lb) {
  try {
    lb.sort ((a, b) => b.score - a.score);
    const canvas = createCanvas(1000, 2000);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '64px Arial, sans-serif';
    
    lb.forEach((person, index) => {
      const y = 260 + index * 80;
      ctx.fillText(`${person.name}  elo: ${person.elo}`, 50, y);
    });
    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });

      // Check if there's an existing scoreboard message
      const channel = client.channels.cache.get('801715347639369762');
      const messages = await channel.messages.fetch();
      const existingMessage = messages.find((msg) => msg.author.id === client.user.id && msg.embeds.length === 0);

      if (existingMessage) {
        // If an existing scoreboard message exists, edit it
        await existingMessage.edit({ files: [attachment] });
      } else {
        // If no existing scoreboard message, send a new one
        await channel.send( attachment);
      }
    } catch (error) {
      console.error('Error:', error);
    }
}
*/

client.login(process.env.BOT_TOKEN);