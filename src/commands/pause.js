import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a música atual'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Não há nenhuma música tocando no momento!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const paused = queue.pause();
    if (paused) {
      return interaction.reply({
        embeds: [createSuccessEmbed('Pausado', 'A reprodução foi pausada.')]
      });
    } else {
      return interaction.reply({
        embeds: [createErrorEmbed('A música já está pausada ou não pôde ser pausada!')],
        flags: [MessageFlags.Ephemeral]
      });
    }
  }
};
