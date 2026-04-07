const { Client, GatewayIntentBits } = require("discord.js")
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice")
const play = require("play-dl")

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildVoiceStates
]
})

const prefix = "!"

client.once("ready", () => {
console.log("Bot online!")
})

client.on("messageCreate", async message => {

if(message.author.bot) return
if(!message.content.startsWith(prefix)) return

const args = message.content.slice(prefix.length).trim().split(/ +/)
const comando = args.shift().toLowerCase()

// PLAY
if(comando === "play"){

const voiceChannel = message.member.voice.channel
if(!voiceChannel) return message.reply("Entre em um canal de voz!")

const query = args.join(" ")

if(!query) return message.reply("Coloque o nome da música ou link")

const connection = joinVoiceChannel({
channelId: voiceChannel.id,
guildId: message.guild.id,
adapterCreator: message.guild.voiceAdapterCreator
})

const stream = await play.stream(query)

const resource = createAudioResource(stream.stream, {
inputType: stream.type
})

const player = createAudioPlayer()

connection.subscribe(player)
player.play(resource)

message.reply("🎵 Tocando agora!")

}

// STOP
if(comando === "stop"){

const voiceChannel = message.member.voice.channel
if(!voiceChannel) return message.reply("Entre na call")

voiceChannel.leave()

message.reply("⏹️ Música parada")

}

})

// TOKEN
client.login(process.env.TOKEN)
