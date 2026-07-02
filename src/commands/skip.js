import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula a música atual'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Não há nenhuma música tocando no momento!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const skipped = queue.skip();
    if (skipped) {
      return interaction.reply({
        embeds: [createSuccessEmbed('Música Pulada', `Pulou **${queue.currentTrack.title}**.`)]
      });
    } else {
      return interaction.reply({
        embeds: [createErrorEmbed('Não foi possível pular a música!')],
        flags: [MessageFlags.Ephemeral]
      });
    }
  }
};
