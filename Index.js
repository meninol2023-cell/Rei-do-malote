const { Client } = require('discord.js');
const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });

client.once('ready', () => {
  console.log('Bot online!');
});

client.login('MTQ5MDg3MTMyMDAxODE1Nzc1Mg.G3_wR9.JRVVK-rS1p2BeHCyYA0_dX4PtaVBHsD3rQOQ7E');
