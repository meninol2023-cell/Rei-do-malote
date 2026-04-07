const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.on("ready", () => {
  console.log("Bot de música online!");
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(" ");
  const cmd = args.shift();

  if (cmd === "play") {

    const canal = message.member.voice.channel;
    if (!canal) return message.reply("Entre em um canal de voz!");

    const connection = joinVoiceChannel({
      channelId: canal.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    const yt = await play.stream(args[0]);

    const resource = createAudioResource(yt.stream, {
      inputType: yt.type
    });

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎵 Tocando música!");
  }

  if (cmd === "stop") {
    message.reply("⏹️ Música parada.");
    process.exit();
  }

});

client.login("MTQ5MDg3MTMyMDAxODE1Nzc1Mg.G1-Qg3.nicVxMjKZrJjd9kJFQbXI52qpE3cypQw_7lRNU");
