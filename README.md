---
title: Discord Music Bot
emoji: 🎵
colorFrom: violet
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# Discord Music Bot 🎵

Um bot de música moderno, elegante e de alta performance para o Discord, com suporte para reprodução de conteúdos do **YouTube, Spotify, SoundCloud e Deezer** (faixas, álbuns e playlists) utilizando a tecnologia de **Slash Commands** (`/`) e respostas visuais premium (Embeds).

---

## ✨ Recursos

*   **Multiplataforma Nocivo**: Suporta links e pesquisas do **YouTube** (🔴), **Spotify** (🟢), **SoundCloud** (🟠) e **Deezer** (🟣).
*   **Identificação Visual (Ícones)**: Identifica automaticamente a plataforma de origem do link inserido e exibe o ícone e nome da plataforma correspondente nas mensagens embed.
*   **Integração Híbrida Inteligente**: Adiciona playlists inteiras do Spotify e Deezer instantaneamente na fila, fazendo a busca correspondente de fluxo no YouTube de forma diferida (na hora do play) para evitar lentidão e rate-limit.
*   **Suporte Completo a Playlists**: Toca playlists do YouTube, do Spotify e do SoundCloud diretamente.
*   **Controles de Reprodução**: `/pause`, `/resume`, `/skip`, `/stop`, `/volume`, `/shuffle` e `/loop`.
*   **Interface Premium**: Embeds ricos com cores harmoniosas, thumbnails de capa e barra de progresso visual em tempo real no comando `/nowplaying`.
*   **Reprodutor Estável (yt-dlp)**: Utiliza a tecnologia estável do **`yt-dlp`** (via `youtube-dl-exec`) para extração de fluxo de áudio, contornando bloqueios de rede e decodificação do YouTube.
*   **Desconexão Automática**: O bot sai automaticamente do canal de voz após 2 minutos de inatividade para economizar recursos do servidor.
*   **Pronto para Produção**: Estrutura modular, variáveis de ambiente seguras e pronto para repositório do GitHub (com `.gitignore` configurado).

---

## 🛠️ Pré-requisitos

*   **Node.js**: Versão `18.0.0` ou superior instalada (Testado na v20/v22/v24).
*   **FFmpeg**: O processamento de áudio exige o FFmpeg. Este projeto já possui a dependência `ffmpeg-static`, que instala um binário funcional automaticamente para a maioria dos sistemas operacionais (Windows, Linux, macOS).
*   **Criptografia de Voz (DAVE)**: Este bot já inclui suporte nativo ao novo protocolo de criptografia ponta a ponta do Discord (DAVE) através das dependências `@discordjs/voice` atualizada e `@snazzah/davey`.


---

## 🚀 Como Instalar e Configurar

### 1. Obter o Código
Baixe os arquivos deste projeto ou clone o repositório em sua máquina:
```bash
git clone <[Discord-Music-Bot](https://github.com/nicolasaj0/Discord-Music-Bot)>
cd DiscordBot
```

### 2. Instalar Dependências
No diretório do projeto, execute:
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Renomeie ou copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Abra o arquivo `.env` com seu editor de texto e preencha com as credenciais do seu bot no Discord:
```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
```

---

## 📋 Guia: Configurando o Bot no Discord Developer Portal

Siga estes passos para obter seu `DISCORD_TOKEN` e `CLIENT_ID`, além de colocar o bot no seu servidor:

### Passo 1: Criar a Aplicação
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique no botão **"New Application"** no canto superior direito.
3. Dê um nome ao seu bot e concorde com os termos. Clique em **"Create"**.
4. Na tela inicial da aplicação, você verá o campo **APPLICATION ID**. Copie este valor; ele será o seu `CLIENT_ID` no arquivo `.env`.

### Passo 2: Criar o Bot
1. No menu lateral esquerdo, clique na aba **"Bot"**.
2. Clique no botão **"Add Bot"** e confirme em **"Yes, do it!"**.
3. Na seção do Bot, clique em **"Reset Token"** e depois em **"Copy"**. Este é o seu `DISCORD_TOKEN` que deve ser colado no arquivo `.env`.
   *   ⚠️ *Nunca compartilhe este token com ninguém! Se ele vazar, resete-o imediatamente.*

### Passo 3: Habilitar Intenções de Gateway (Gateway Intents)
1. Ainda na aba **"Bot"**, role para baixo até encontrar a seção **"Privileged Gateway Intents"**.
2. **Ative** as seguintes opções:
   *   **Presence Intent** (Opcional, mas recomendado)
   *   **Server Members Intent** (Opcional, mas recomendado)
   *   **Message Content Intent** (Importante para leitura de canais se necessário, embora usemos comandos `/` que dispensam isso por padrão, é altamente recomendado deixar ativo para compatibilidade).
3. Clique em **"Save Changes"** no rodapé da página.

### Passo 4: Criar o Link de Convite para o Servidor
1. No menu lateral esquerdo, clique na aba **"OAuth2"** e depois em **"URL Generator"**.
2. Na caixa **SCOPES**, marque:
   *   `bot`
   *   `applications.commands` (necessário para os comandos com `/` funcionarem)
3. Na caixa **BOT PERMISSIONS** (que aparece abaixo dos escopos), marque as seguintes permissões necessárias para voz e mensagens:
   *   **Text Permissions**:
       *   `Send Messages`
       *   `Embed Links`
       *   `Read Message History`
   *   **Voice Permissions**:
       *   `Connect`
       *   `Speak`
       *   `Use Voice Activity`
4. Copie a URL gerada no rodapé da página.
5. Cole essa URL no seu navegador e selecione em qual servidor quer adicionar o bot.



## ⚡ Registrando e Rodando o Bot

### 1. Registrar os Slash Commands (/)
Antes de iniciar o bot pela primeira vez (ou sempre que adicionar/modificar comandos), você precisa registrá-los na API do Discord:
```bash
npm run deploy
```
Você verá uma mensagem informando que os comandos foram registrados globalmente.

### 2. Iniciar o Bot
Agora, basta iniciar o processo principal do bot:
```bash
npm start
```
Se tudo estiver correto, você verá no console:
```text
=================================
🤖 Bot de Música está ONLINE!
👤 Logado como: SeuBot#1234
=================================
```

---

## 🎵 Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `/play <busca>` | Toca uma música, playlist do YouTube ou link do Spotify (faixa/álbum/playlist). |
| `/skip` | Pula a música que está tocando no momento. |
| `/pause` | Pausa a reprodução da música. |
| `/resume` | Retoma a reprodução da música pausada. |
| `/stop` | Para a reprodução, limpa toda a fila e desconecta do canal de voz. |
| `/queue` | Mostra a lista das próximas músicas na fila e o status do bot. |
| `/nowplaying` | Exibe a música atual com uma barra de progresso visual em tempo real. |
| `/volume <valor>` | Define o volume de áudio do bot (entre 0 e 100). |
| `/loop <modo>` | Altera o modo de repetição entre: Desativado (`off`), Música Atual (`track`), ou Fila Inteira (`queue`). |
| `/shuffle` | Embaralha aleatoriamente as músicas na fila. |

---

## 🔧 Solução de Problemas (Troubleshooting)

### 1. O bot entra no canal de voz, mas não toca áudio e fica mudo
*   **Problema de Criptografia DAVE**: O Discord exige criptografia ponta a ponta obrigatória em chamadas de voz. Certifique-se de que a biblioteca `@discordjs/voice` está na versão `0.19.2` ou superior e que o pacote `@snazzah/davey` está instalado.
*   **Portas UDP Bloqueadas**: A transmissão de áudio no Discord utiliza protocolo UDP. Certifique-se de que a sua rede local (ou hospedagem) possui as portas de saída UDP abertas (intervalo `50000–65535`).

### 2. Erro de inicialização da stream (`TypeError: Invalid URL`)
*   Se você encontrar erros relacionados a URLs inválidas ou `undefined` vindo de streams de áudio do YouTube, isso indica que o `play-dl` falhou em obter os dados de mídia por conta de atualizações de segurança do YouTube. O bot foi atualizado para contornar isso usando o `yt-dlp` em segundo plano. Mantenha as dependências sempre atualizadas.

---

## 🛡️ Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes (caso queira criá-lo).
