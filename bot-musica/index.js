const { 
  Client, 
  GatewayIntentBits 
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const play = require("play-dl");

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

const queue = new Map();

client.once("ready", () => {
  console.log(`Logado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "play") {
    execute(message, args);
  }
});

// ================= PLAY =================

async function execute(message, args) {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel)
    return message.reply("❌ Entre em um canal de voz!");

  const permissions = voiceChannel.permissionsFor(message.guild.members.me);

  if (!permissions.has("Connect") || !permissions.has("Speak"))
    return message.reply("❌ Sem permissão!");

  const url = args[0];

if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
  return message.reply("❌ Link inválido!");
}

  let serverQueue = queue.get(message.guild.id);

  const song = {
    title: "Música",
    url: url
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      player: createAudioPlayer(),
      songs: [],
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      const connection = joinVoiceChannel({
  channelId: voiceChannel.id,
  guildId: message.guild.id,
  adapterCreator: message.guild.voiceAdapterCreator,
});

queueConstruct.connection = connection;

// 🔥 ESSA LINHA É OBRIGATÓRIA
connection.subscribe(queueConstruct.player);

playSong(message.guild, queueConstruct.songs[0]);

    } catch (err) {
      console.error(err);
      queue.delete(message.guild.id);
      return message.reply("❌ Erro ao entrar na call.");
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send("🎵 Música adicionada na fila!");
  }
}

// ================= TOCAR =================

async function playSong(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.connection.destroy();
    queue.delete(guild.id);
    return;
  }

  try {
    const stream = await play.stream(song.url, {
  discordPlayerCompatibility: true
});

const resource = createAudioResource(stream.stream, {
  inputType: stream.type,
});

    serverQueue.player.play(resource);
    serverQueue.textChannel.send("▶️ Tocando música!");

    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    });

  } catch (err) {
    console.error("ERRO STREAM:", err);
    serverQueue.textChannel.send("❌ Erro ao tocar música.");
  }
}

client.login(process.env.TOKEN);
