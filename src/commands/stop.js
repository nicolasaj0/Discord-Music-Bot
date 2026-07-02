import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a reprodução, limpa a fila e desconecta do canal de voz'),

  async execute(interaction) {
    const queue = queueManager.getQueue(interaction.guildId);

    // Verifica se a fila existe e tem uma conexão ativa
    if (!queue || (!queue.currentTrack && !queue.connection)) {
      return interaction.reply({
        embeds: [createErrorEmbed('O bot não está tocando nada neste servidor!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    queue.stop();
    return interaction.reply({
      embeds: [createSuccessEmbed('Reprodução Interrompida', 'Fila limpa e bot desconectado com sucesso.')]
    });
  }
};
