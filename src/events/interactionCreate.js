import { createErrorEmbed } from '../utils/embeds.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    // Apenas responde a comandos de texto (Slash Commands)
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
