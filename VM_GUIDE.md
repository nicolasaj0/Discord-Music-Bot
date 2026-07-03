# 🌐 Guia de Gerenciamento da VM Azure - Discord Music Bot

Este guia contém todos os comandos essenciais para gerenciar a Máquina Virtual Ubuntu no Azure e o ciclo de vida do bot de música.

---

## 🔑 1. Acesso SSH (Rodar no PowerShell Local)

Toda vez que precisar acessar a sua máquina virtual na nuvem:

```bash
ssh -i "C:\Users\nickj\Documents\Projetos\Linux VM\discordbot1618_key.pem" azureuser@20.164.0.10
```

---

## 📊 2. Monitoramento e Diagnóstico (Rodar na VM)

Para ver a saúde do bot e verificar logs:

*   **Status Geral (Ver se o bot está online e quanto de RAM consome)**:
    ```bash
    pm2 status
    ```
*   **Logs em Tempo Real (Ver comandos, reproduções e erros)**:
    ```bash
    pm2 logs discord-music-bot
    ```
    *Dica: Pressione `Ctrl + C` para fechar a visualização de logs e voltar para o terminal.*
*   **Logs do Sistema do PM2**:
    ```bash
    pm2 logs
    ```
*   **Informações Completas do Bot**:
    ```bash
    pm2 show discord-music-bot
    ```

---

## 🔄 3. Como Atualizar o Bot com Novas Versões

Se você fez alterações no código localmente, mandou para o GitHub com `git push` e quer atualizar o servidor:

```bash
# 1. Entre na pasta do bot
cd ~/Discord-Music-Bot

# 2. Puxe o código atualizado do GitHub
git pull

# 3. Reinicie o bot para aplicar as atualizações
pm2 restart discord-music-bot
```

---

## ⚙️ 4. Gerenciamento do Processo do Bot (PM2 - Rodar na VM)

*   **Reiniciar o bot**:
    ```bash
    pm2 restart discord-music-bot
    ```
*   **Parar o bot (Desligar)**:
    ```bash
    pm2 stop discord-music-bot
    ```
*   **Iniciar o bot (se estiver parado)**:
    ```bash
    pm2 start discord-music-bot
    ```
*   **Salvar o estado atual** (Sempre que adicionar ou reconfigurar o processo do PM2):
    ```bash
    pm2 save
    ```

---

## 📝 5. Editando Configurações e Arquivos de Apoio (Rodar na VM)

Sempre navegue para a pasta do bot antes de ler/editar arquivos:
```bash
cd ~/Discord-Music-Bot
```

*   **Editar chaves e tokens (`.env`)**:
    ```bash
    nano .env
    ```
*   **Editar/Atualizar cookies do YouTube (`cookies.txt`)**:
    ```bash
    nano cookies.txt
    ```
    *Comandos básicos do editor Nano:*
    *   **Colar texto**: Clique com o **botão direito do mouse** no terminal (ou `Shift + Insert`).
    *   **Salvar alterações**: Pressione `Ctrl + O` e dê `Enter`.
    *   **Fechar editor**: Pressione `Ctrl + X`.

---

## 💡 6. Dicas de Otimização e Rede

*   **Atraso do YouTube**: O atraso de 4 segundos antes de iniciar músicas do YouTube é proposital e gerado pelo extrator `yt-dlp` para evitar que o IP da sua VM seja banido por atividade robótica.
*   **Teste de Latência Sem Bloqueios**: Toque uma música do **SoundCloud** para testar. Como o SoundCloud não possui restrições de IP, o bot começará a tocar quase instantaneamente!
*   **Duração dos Cookies**: Os cookies no `cookies.txt` duram vários meses. Se o bot voltar a dar erros de "Confirm you are not a bot" no futuro, repita o processo de exportar e colar o arquivo `cookies.txt` na VM.
