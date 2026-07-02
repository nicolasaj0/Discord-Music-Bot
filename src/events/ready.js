import { ActivityType, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`\n=================================`);
    console.log(`🤖 Bot de Música está ONLINE!`);
    console.log(`👤 Logado como: ${client.user.tag}`);
    console.log(`=================================\n`);
    
    // Configura a atividade do bot (ex: Ouvindo música | /play)
    client.user.setActivity('música | /play', { type: ActivityType.Listening });
  }
};
