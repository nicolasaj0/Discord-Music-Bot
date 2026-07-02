import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Retoma a música pausada'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Não há nenhuma música na fila!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const resumed = queue.resume();
    if (resumed) {
      return interaction.reply({
        embeds: [createSuccessEmbed('Retomado', 'A reprodução foi retomada.')]
      });
    } else {
      return interaction.reply({
        embeds: [createErrorEmbed('A música já está tocando ou não pôde ser retomada!')],
        flags: [MessageFlags.Ephemeral]
      });
    }
  }
};
