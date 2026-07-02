import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Altera o modo de repetição das músicas')
    .addStringOption(option =>
      option
        .setName('modo')
        .setDescription('Escolha o modo de repetição')
        .setRequired(true)
        .addChoices(
          { name: 'Desativado (Off)', value: 'off' },
          { name: 'Repetir Música Atual (Track)', value: 'track' },
          { name: 'Repetir Fila Inteira (Queue)', value: 'queue' }
        )
    ),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Não há nenhuma música tocando para configurar repetição!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const mode = interaction.options.getString('modo');
    queue.setLoopMode(mode);

    const modeLabels = {
      off: 'desativado',
      track: 'repetir música atual 🔂',
      queue: 'repetir fila inteira 🔁'
    };

    return interaction.reply({
      embeds: [createSuccessEmbed('Loop Atualizado', `O modo de repetição foi alterado para: **${modeLabels[mode]}**.`)]
    });
  }
};
