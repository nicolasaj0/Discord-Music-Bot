import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { queueManager } from '../music/QueueManager.js';
import { AudioPlayerStatus } from '@discordjs/voice';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    // 1. LIDAR COM BOTÕES (Painel do DJ)
    if (interaction.isButton()) {
      const queue = queueManager.getQueue(interaction.guildId);
      
      if (!queue || !queue.currentTrack) {
        return interaction.reply({ content: 'Nenhuma música está tocando no momento.', ephemeral: true });
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel || voiceChannel.id !== queue.connection?.joinConfig?.channelId) {
        return interaction.reply({ content: 'Você precisa estar no mesmo canal de voz que eu para usar os botões!', ephemeral: true });
      }

      try {
        if (interaction.customId === 'btn_play_pause') {
          if (queue.player?.state.status === AudioPlayerStatus.Playing) {
            queue.pause();
            await interaction.reply({ content: '⏸️ Música pausada.', ephemeral: true });
          } else {
            queue.resume();
            await interaction.reply({ content: '▶️ Música retomada.', ephemeral: true });
          }
        } 
        else if (interaction.customId === 'btn_skip') {
          queue.skip();
          await interaction.reply({ content: '⏭️ Música pulada.', ephemeral: true });
        } 
        else if (interaction.customId === 'btn_stop') {
          queue.stop();
          await interaction.reply({ content: '⏹️ Música parada e fila limpa.', ephemeral: true });
        }
      } catch (e) {
        console.error('Erro ao processar botão:', e);
        await interaction.reply({ content: 'Ocorreu um erro ao executar a ação.', ephemeral: true });
      }
      return;
    }

    // 2. LIDAR COM SLASH COMMANDS
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
      return;
    }

    try {
      console.log(`[Comando] ${interaction.user.tag} executou /${interaction.commandName} no servidor: ${interaction.guild.name}`);
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro ao executar o comando /${interaction.commandName}:`, error);

      const errorEmbed = createErrorEmbed('Houve um erro ao executar este comando!');

      // Envia uma resposta apropriada se o comando já foi respondido ou adiado
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
      }
    }
  }
};
