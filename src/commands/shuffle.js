import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Embaralha as músicas na fila'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || queue.tracks.length < 2) {
      return interaction.reply({
        embeds: [createErrorEmbed('Você precisa de pelo menos 2 músicas na fila para embaralhar!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const shuffled = queue.shuffle();
    if (shuffled) {
      return interaction.reply({
        embeds: [createSuccessEmbed('Fila Embaralhada', 'As músicas da fila foram reordenadas aleatoriamente.')]
      });
    } else {
      return interaction.reply({
        embeds: [createErrorEmbed('Não foi possível embaralhar a fila!')],
        flags: [MessageFlags.Ephemeral]
      });
    }
  }
};
