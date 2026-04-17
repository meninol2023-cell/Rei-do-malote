const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.get("/", (req, res) => {
  res.send("Bot online!");
});
app.listen(3000, () => {
  console.log("Servidor web ligado");
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logado como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
