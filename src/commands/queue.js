import { SlashCommandBuilder, EmbedBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createErrorEmbed, COLORS } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Exibe a fila de músicas atual'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
      return interaction.reply({
        embeds: [createErrorEmbed('A fila está vazia no momento!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.PRIMARY)
      .setTitle(`Fila de Reprodução - ${interaction.guild.name}`)
      .setTimestamp();

    let description = '';

    // Adiciona música atual
    if (queue.currentTrack) {
      const requester = queue.currentTrack.requestedBy?.username || queue.currentTrack.requestedBy || 'Desconhecido';
      description += `**Tocando Agora:**\n[${queue.currentTrack.title}](${queue.currentTrack.url || '#'}) | \`${queue.currentTrack.durationLabel}\` (Adicionado por: *${requester}*)\n\n`;
    }

    // Adiciona as próximas músicas
    if (queue.tracks.length > 0) {
      description += `**Próximas Músicas:**\n`;
      
      // Mostra no máximo 10 músicas para não estourar o limite de caracteres do Discord
      const maxTracks = 10;
      const tracksToShow = queue.tracks.slice(0, maxTracks);

      tracksToShow.forEach((track, index) => {
        const titleLink = track.url ? `[${track.title}](${track.url})` : track.title;
        const unresolvedSuffix = track.unresolved ? ' 🎵 *(Spotify)*' : '';
        const requester = track.requestedBy?.username || track.requestedBy || 'Desconhecido';
        description += `\`${index + 1}.\` ${titleLink}${unresolvedSuffix} | \`${track.durationLabel}\` (Adicionado por: *${requester}*)\n`;
      });

      if (queue.tracks.length > maxTracks) {
        description += `\n*...e mais ${queue.tracks.length - maxTracks} música(s) na fila.*`;
      }
    } else {
      description += '*Sem mais músicas na fila.*';
    }

    embed.setDescription(description);

    // Mostra status adicionais do player
    const loopStatus = queue.loopMode === 'track' ? '🔂 Música' : queue.loopMode === 'queue' ? '🔁 Fila' : '❌';
    embed.addFields(
      { name: 'Modo Repetição', value: loopStatus, inline: true },
      { name: 'Volume', value: `🔊 ${Math.round(queue.volume * 100)}%`, inline: true },
      { name: 'Total de Músicas', value: `${queue.tracks.length + (queue.currentTrack ? 1 : 0)}`, inline: true }
    );

    return interaction.reply({ embeds: [embed] });
  }
};
