import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import play from 'play-dl';

// Carrega as variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa o cliente do Discord com as intenções necessárias para música
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

// 1. Carrega dinamicamente todos os comandos da pasta src/commands/
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const fileUrl = pathToFileURL(filePath).href;
  const commandModule = await import(fileUrl);
  const command = commandModule.default;

  if (command && command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[AVISO] O comando em ${filePath} está sem "data" ou "execute".`);
  }
}

// 2. Carrega dinamicamente todos os eventos da pasta src/events/
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const fileUrl = pathToFileURL(filePath).href;
  const eventModule = await import(fileUrl);
  const event = eventModule.default;

  if (event && event.name && event.execute) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

import http from 'http';

// Servidor Web básico para Keep-Alive e vinculação de porta no Hugging Face Spaces
const port = process.env.PORT || 7860;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot está online e rodando!\n');
}).listen(port, () => {
  console.log(`📡 Servidor Web Keep-Alive ativo na porta ${port}`);
});

// 4. Conexão com o Discord
const token = process.env.DISCORD_TOKEN;
if (!token || token === 'seu_token_aqui') {
  console.error('\n❌ ERRO: O token do bot do Discord (DISCORD_TOKEN) não foi configurado no arquivo .env!');
  console.error('Por favor, siga as instruções no arquivo README.md para configurar o bot.\n');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('\n❌ Falha ao realizar login no Discord!');
  console.error('Verifique se o token no arquivo .env é válido e se o bot tem as configurações corretas.\n');
  console.error(error);
});
