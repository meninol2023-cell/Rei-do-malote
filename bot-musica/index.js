const { Client, GatewayIntentBits } = require("discord.js")
const { DisTube } = require("distube")
const { YtDlpPlugin } = require("@distube/yt-dlp")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [new YtDlpPlugin()]
})

const prefix = "!"

client.on("ready", () => {
  console.log(`Bot online como ${client.user.tag}`)
})

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).trim().split(/ +/)
  const cmd = args.shift().toLowerCase()

  const voiceChannel = message.member.voice.channel
  if (!voiceChannel) return message.reply("❌ Entre em um canal de voz!")

  if (cmd === "play") {
    const query = args.join(" ")
    if (!query) return message.reply("❌ Coloque o nome da música ou link!")

    distube.play(voiceChannel, query, {
      member: message.member,
      textChannel: message.channel
    })
  }

  if (cmd === "skip") {
    distube.skip(message)
    message.channel.send("⏭ Música pulada!")
  }

  if (cmd === "stop") {
    distube.stop(message)
    message.channel.send("⛔ Música parada!")
  }

  if (cmd === "pause") {
    distube.pause(message)
    message.channel.send("⏸ Música pausada!")
  }

  if (cmd === "resume") {
    distube.resume(message)
    message.channel.send("▶ Música retomada!")
  }

  if (cmd === "queue") {
    const queue = distube.getQueue(message)
    if (!queue) return message.channel.send("❌ Não tem música na fila")

    message.channel.send(
      "🎶 Fila:\n" +
        queue.songs.map((song, i) => `${i + 1}. ${song.name}`).join("\n")
    )
  }

  if (cmd === "volume") {
    const volume = parseInt(args[0])
    if (!volume) return message.reply("Coloque um número!")

    distube.setVolume(message, volume)
    message.channel.send(`🔊 Volume alterado para ${volume}`)
  }
})

distube
  .on("playSong", (queue, song) =>
    queue.textChannel.send(`🎶 Tocando: **${song.name}**`)
  )
  .on("addSong", (queue, song) =>
    queue.textChannel.send(`✅ Adicionado à fila: **${song.name}**`)
  )

client.login("SEU_TOKEN_AQUI")
