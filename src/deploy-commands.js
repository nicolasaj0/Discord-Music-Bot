import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

async function loadCommands() {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    try {
      const commandModule = await import(fileUrl);
      const command = commandModule.default;
      
      if (command && command.data && command.execute) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[AVISO] O comando em ${file} está sem a propriedade "data" ou "execute" obrigatória.`);
      }
    } catch (error) {
      console.error(`Erro ao carregar o comando ${file}:`, error);
    }
  }
}

async function deploy() {
  await loadCommands();

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token || token === 'seu_token_aqui') {
    console.error('ERRO: DISCORD_TOKEN não foi configurado no arquivo .env!');
    process.exit(1);
  }
  if (!clientId || clientId === 'seu_client_id_aqui') {
    console.error('ERRO: CLIENT_ID não foi configurado no arquivo .env!');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`Iniciando a atualização de ${commands.length} comandos globais de aplicativo (/) no Discord...`);

    // Registra comandos de forma global
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`Sucesso: ${data.length} comandos de aplicativo (/) foram registrados globalmente!`);
  } catch (error) {
    console.error('Ocorreu um erro ao registrar os comandos:', error);
  }
}

deploy();
