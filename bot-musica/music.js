const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const play = require("play-dl");

const queue = new Map();

async function execute(message, args) {

const voiceChannel = message.member.voice.channel;
if (!voiceChannel) return message.reply("❌ Entre em um canal de voz.");

const permissions = voiceChannel.permissionsFor(message.client.user);
if (!permissions.has("Connect") || !permissions.has("Speak")) {
return message.reply("❌ Não tenho permissão para entrar na call.");
}

const serverQueue = queue.get(message.guild.id);

const url = args[0];

if (!url) return message.reply("❌ Envie o link da música.");

const songInfo = await play.video_info(url);
const song = {
title: songInfo.video_details.title,
url: songInfo.video_details.url
};

if (!serverQueue) {

const queueContruct = {
textChannel: message.channel,
voiceChannel: voiceChannel,
connection: null,
player: createAudioPlayer(),
songs: [],
loop: false
};

queue.set(message.guild.id, queueContruct);

queueContruct.songs.push(song);

try {

const connection = joinVoiceChannel({
channelId: voiceChannel.id,
guildId: message.guild.id,
adapterCreator: message.guild.voiceAdapterCreator
});

queueContruct.connection = connection;
connection.subscribe(queueContruct.player);

playSong(message.guild, queueContruct.songs[0]);

} catch (err) {

queue.delete(message.guild.id);
return message.channel.send("❌ Erro ao entrar na call.");

}

} else {

serverQueue.songs.push(song);
return message.channel.send(`🎵 Adicionada à fila: **${song.title}**`);

}

}

async function playSong(guild, song) {

const serverQueue = queue.get(guild.id);

if (!song) {

serverQueue.connection.destroy();
queue.delete(guild.id);
return;

}

const stream = await play.stream(song.url);

const resource = createAudioResource(stream.stream, {
inputType: stream.type
});

serverQueue.player.play(resource);

serverQueue.textChannel.send(`▶ Tocando: **${song.title}**`);

serverQueue.player.on(AudioPlayerStatus.Idle, () => {

if (!serverQueue.loop) serverQueue.songs.shift();

playSong(guild, serverQueue.songs[0]);

});

}

function skip(message) {

const serverQueue = queue.get(message.guild.id);
if (!serverQueue) return message.reply("❌ Nada tocando.");

serverQueue.player.stop();

}

function stop(message) {

const serverQueue = queue.get(message.guild.id);
if (!serverQueue) return message.reply("❌ Nada tocando.");

serverQueue.songs = [];
serverQueue.player.stop();

}

function pause(message) {

const serverQueue = queue.get(message.guild.id);
if (!serverQueue) return;

serverQueue.player.pause();

}

function resume(message) {

const serverQueue = queue.get(message.guild.id);
if (!serverQueue) return;

serverQueue.player.unpause();

}

function queueList(message) {

const serverQueue = queue.get(message.guild.id);

if (!serverQueue) return message.reply("❌ Fila vazia.");

let text = "";

serverQueue.songs.forEach((song, i) => {
text += `${i+1} - ${song.title}\n`;
});

message.channel.send(`🎶 Fila:\n${text}`);

}

function loop(message) {

const serverQueue = queue.get(message.guild.id);
if (!serverQueue) return;

serverQueue.loop = !serverQueue.loop;

message.channel.send(`🔁 Loop ${serverQueue.loop ? "ativado" : "desativado"}`);

}

module.exports = {
execute,
skip,
stop,
pause,
resume,
queueList,
loop
};
