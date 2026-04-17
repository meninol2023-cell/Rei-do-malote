require("./keepAlive");

const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
res.send("Bot online!");
});

app.listen(process.env.PORT || 3000, () => {
console.log("Servidor web ligado");
});

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildVoiceStates
]
});

client.once("ready", () => {
console.log(`Logado como ${client.user.tag}`);
});

const music = require("./music");

client.on("messageCreate", async (message) => {

if (message.author.bot) return;

const prefix = "!";

if (!message.content.startsWith(prefix)) return;

const args = message.content.slice(prefix.length).trim().split(/ +/);

const command = args.shift().toLowerCase();

if (command === "play") {
music.execute(message, args);
}

});

client.login(process.env.TOKEN);
