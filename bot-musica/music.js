const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const play = require("play-dl");

let queue = [];

module.exports = {
  name: "play",
  description: "Tocar música",

  async execute(message, args) {

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Entre em um canal de voz primeiro.");
    }

    const query = args.join(" ");

    if (!query) {
      return message.reply("❌ Coloque o nome ou link da música.");
    }

    const result = await play.search(query, { limit: 1 });

    if (!result.length) {
      return message.reply("❌ Música não encontrada.");
    }

    const song = {
      title: result[0].title,
      url: result[0].url
    };

    queue.push(song);

    message.channel.send(`🎶 **Adicionado à fila:** ${song.title}`);

    if (queue.length === 1) playMusic(message, voiceChannel);

  }
};

async function playMusic(message, voiceChannel) {

  const song = queue[0];

  if (!song) return;

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
  });

  const stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type
  });

  const player = createAudioPlayer();

  player.play(resource);

  connection.subscribe(player);

  message.channel.send(`▶️ Tocando agora: **${song.title}**`);

  player.on(AudioPlayerStatus.Idle, () => {
    queue.shift();
    playMusic(message, voiceChannel);
  });

}
