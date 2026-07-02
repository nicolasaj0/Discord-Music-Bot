import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajusta o volume do bot')
    .addIntegerOption(option =>
      option
        .setName('valor')
        .setDescription('Volume de 0 a 100')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Não há nenhuma música tocando no momento!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const volume = interaction.options.getInteger('valor');
    queue.setVolume(volume);

    return interaction.reply({
      embeds: [createSuccessEmbed('Volume Alterado', `O volume foi definido para **${volume}%**.`)]
    });
  }
};
