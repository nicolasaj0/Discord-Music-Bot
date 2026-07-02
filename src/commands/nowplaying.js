import { SlashCommandBuilder, EmbedBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createErrorEmbed, getPlatformLabel, getPlatformColor, getPlatformIcon } from '../utils/embeds.js';
import { formatDuration, createProgressBar } from '../utils/formatter.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Exibe detalhes da música tocando no momento'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Não há nenhuma música tocando no momento!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const track = queue.currentTrack;
    
    // Obtém o progresso atual do player
    const currentMs = queue.player?.state?.resource?.playbackDuration || 0;
    const totalMs = track.duration;
    
    const progress = createProgressBar(currentMs, totalMs, 18);
    const timeLabel = `${formatDuration(currentMs)} / ${track.durationLabel}`;

    const embed = new EmbedBuilder()
      .setColor(getPlatformColor(track.platform))
      .setAuthor({ 
        name: '💿 | Detalhes da Reprodução', 
        iconURL: getPlatformIcon(track.platform) || undefined 
      })
      .setTitle(track.title)
      .setURL(track.url || '#')
      .setDescription(
        `**Artista/Canal:** \`${track.author || 'Desconhecido'}\`\n` +
        `**Origem:** ${getPlatformLabel(track.platform)}\n\n` +
        `**Progresso:**\n` +
        `▶️ \`[${progress}]\` \`[${timeLabel}]\` 🔊`
      )
      .setTimestamp();

    if (track.thumbnail) {
      embed.setThumbnail(track.thumbnail);
    }

    if (track.requestedBy) {
      embed.setFooter({
        text: `Solicitado por ${track.requestedBy.username || track.requestedBy}`,
        iconURL: track.requestedBy.avatarURL || null
      });
    }

    return interaction.reply({ embeds: [embed] });
  }
};
