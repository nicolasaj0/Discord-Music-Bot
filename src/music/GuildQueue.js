import { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus,
  StreamType
} from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import play from 'play-dl';
import { createMusicEmbed, createErrorEmbed } from '../utils/embeds.js';

export class GuildQueue {
  constructor(guildId, manager) {
    this.guildId = guildId;
    this.manager = manager;
    this.tracks = [];
    this.currentTrack = null;
    this.loopMode = 'off'; // 'off', 'track', 'queue'
    this.volume = 0.5; // 0.0 a 1.0 (padrão 50%)
    this.connection = null;
    this.player = null;
    this.textChannel = null;
    this.idleTimeout = null;
  }

  /**
   * Conecta a um canal de voz
   * @param {VoiceChannel} channel 
   * @param {TextChannel} textChannel 
   */
  join(channel, textChannel) {
    this.textChannel = textChannel;
    this.clearIdleTimeout();

    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    // Monitora o estado da conexão
    this.connection.on('stateChange', (oldState, newState) => {
      console.log(`[Conexão Voz] Canal ${channel.name}: ${oldState.status} -> ${newState.status}`);
    });

    // Cria o player de áudio se não existir
    if (!this.player) {
      this.player = createAudioPlayer();
      this.connection.subscribe(this.player);

      // Monitora o estado do player
      this.player.on('stateChange', (oldState, newState) => {
        console.log(`[Player Áudio]: ${oldState.status} -> ${newState.status}`);
      });

      // Evento de finalização de faixa
      this.player.on(AudioPlayerStatus.Idle, () => {
        this.handleTrackEnd();
      });

      // Evento de erro de áudio
      this.player.on('error', (error) => {
        console.error(`Erro no player de áudio na guild ${this.guildId}:`, error);
        if (this.textChannel) {
          this.textChannel.send({ 
            embeds: [createErrorEmbed(`Ocorreu um erro ao reproduzir a música: **${error.message}**. Pulando para a próxima.`)] 
          }).catch(console.error);
        }
        this.handleTrackEnd(true); // Pula em caso de erro
      });
    }

    // Monitora desconexões
    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        // Tenta se reconectar automaticamente se for uma desconexão temporária
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch (error) {
        // Desconexão real: limpa a fila
        this.destroy();
      }
    });
  }

  /**
   * Adiciona uma música à fila
   * @param {object} track 
   */
  addTrack(track) {
    this.tracks.push(track);
    this.clearIdleTimeout();
    if (!this.currentTrack) {
      this.playNext();
    }
  }

  /**
   * Adiciona várias músicas (playlists) à fila
   * @param {Array} tracks 
   */
  addTracks(tracks) {
    this.tracks.push(...tracks);
    this.clearIdleTimeout();
    if (!this.currentTrack) {
      this.playNext();
    }
  }

  /**
   * Toca a próxima música na fila
   */
  async playNext() {
    if (this.tracks.length === 0) {
      this.currentTrack = null;
      this.player?.stop();
      this.startIdleTimeout();
      return;
    }

    this.currentTrack = this.tracks.shift();
    this.clearIdleTimeout();

    try {
      // Resolve o link do YouTube se for uma faixa não resolvida (ex: Spotify)
      if (this.currentTrack.unresolved) {
        const searchQuery = `${this.currentTrack.title} ${this.currentTrack.author}`;
        const searchResults = await play.search(searchQuery, { limit: 1 });
        if (searchResults && searchResults.length > 0) {
          this.currentTrack.url = searchResults[0].url;
          this.currentTrack.unresolved = false;
          if (searchResults[0].thumbnails && searchResults[0].thumbnails[0]) {
            this.currentTrack.thumbnail = searchResults[0].thumbnails[0].url;
          }
        } else {
          throw new Error('Nenhum vídeo correspondente encontrado no YouTube.');
        }
      }

      // Garante que a conexão de voz está pronta antes de enviar o stream
      if (this.connection) {
        try {
          await entersState(this.connection, VoiceConnectionStatus.Ready, 5000);
        } catch (e) {
          console.warn(`[Voz] Conexão de voz não ficou pronta em 5s na guild ${this.guildId}. Tentando mesmo assim.`);
        }
      }

      // Obtém o stream diretamente via play-dl
      const stream = await play.stream(this.currentTrack.url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true
      });

      // Aplica o volume configurado
      resource.volume.setVolume(this.volume);

      this.player.play(resource);

      // Envia notificação de reprodução
      if (this.textChannel && this.currentTrack) {
        this.textChannel.send({
          embeds: [createMusicEmbed(this.currentTrack, 'Tocando Agora', this.currentTrack.requestedBy)]
        }).catch(console.error);
      }
    } catch (error) {
      console.error('Erro ao iniciar stream:', error);
      if (this.textChannel) {
        this.textChannel.send({
          embeds: [createErrorEmbed(`Não foi possível tocar **${this.currentTrack?.title || 'a música'}**. Erro: ${error.message}`)]
        }).catch(console.error);
      }
      this.playNext(); // Tenta a próxima se falhar
    }
  }

  /**
   * Trata o final de uma música (Idle)
   * @param {boolean} forceSkip - Se foi pulado manualmente
   */
  handleTrackEnd(forceSkip = false) {
    if (!forceSkip && this.currentTrack) {
      if (this.loopMode === 'track') {
        // Recoloca a mesma música na frente da fila
        this.tracks.unshift(this.currentTrack);
      } else if (this.loopMode === 'queue') {
        // Envia a música tocada para o fim da fila
        this.tracks.push(this.currentTrack);
      }
    }

    this.playNext();
  }

  /**
   * Pula a música atual
   */
  skip() {
    if (!this.currentTrack) return false;

    this.player?.stop(); // Isso vai disparar o evento Idle e consequentemente o handleTrackEnd
    return true;
  }

  /**
   * Pausa a música
   */
  pause() {
    if (this.player && this.player.state.status === AudioPlayerStatus.Playing) {
      return this.player.pause();
    }
    return false;
  }

  /**
   * Retoma a música
   */
  resume() {
    if (this.player && this.player.state.status === AudioPlayerStatus.Paused) {
      return this.player.unpause();
    }
    return false;
  }

  /**
   * Para a reprodução, limpa tudo e desconecta
   */
  stop() {
    this.destroy();
  }

  /**
   * Define o volume da música
   * @param {number} vol - Volume de 0 a 100
   */
  setVolume(vol) {
    this.volume = vol / 100;
    if (this.player?.state?.resource?.volume) {
      this.player.state.resource.volume.setVolume(this.volume);
    }
    return true;
  }

  /**
   * Define o modo de repetição
   * @param {string} mode - 'off', 'track' ou 'queue'
   */
  setLoopMode(mode) {
    if (['off', 'track', 'queue'].includes(mode)) {
      this.loopMode = mode;
      return true;
    }
    return false;
  }

  /**
   * Embaralha a fila de músicas
   */
  shuffle() {
    if (this.tracks.length < 2) return false;
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
    return true;
  }

  /**
   * Inicia o timer para desconectar em caso de inatividade (2 minutos)
   */
  startIdleTimeout() {
    this.clearIdleTimeout();
    this.idleTimeout = setTimeout(() => {
      if (this.textChannel) {
        this.textChannel.send({
          embeds: [createInfoEmbed('Inatividade', 'Saindo do canal de voz devido à inatividade.')]
        }).catch(console.error);
      }
      this.destroy();
    }, 120000); // 2 minutos
  }

  /**
   * Limpa o timer de inatividade
   */
  clearIdleTimeout() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }

  /**
   * Calcula o tempo estimado em milissegundos até que uma música no índice desejado toque.
   * @param {number} [trackIndex] - O índice da música na fila (opcional, por padrão o fim da fila)
   * @returns {number} - Tempo em milissegundos
   */
  getEstimatedTimeUntil(trackIndex) {
    if (!this.currentTrack) return 0;
    
    let totalMs = 0;
    
    // Tempo restante da música atual tocando
    const playbackDuration = this.player?.state?.resource?.playbackDuration || 0;
    const currentRemaining = Math.max(0, this.currentTrack.duration - playbackDuration);
    totalMs += currentRemaining;
    
    // Soma a duração das músicas na fila até o índice especificado
    const limit = trackIndex !== undefined ? trackIndex : this.tracks.length;
    for (let i = 0; i < limit; i++) {
      totalMs += this.tracks[i].duration || 0;
    }
    
    return totalMs;
  }

  /**
   * Limpa e destroi a fila do servidor
   */
  destroy() {
    this.clearIdleTimeout();
    this.tracks = [];
    this.currentTrack = null;

    this.player?.stop();
    this.player = null;

    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }

    this.manager.deleteQueue(this.guildId);
  }
}

// Auxiliar para importar dinamicamente o entersState se necessário
async function entersState(connection, status, timeout) {
  const { entersState: djsEntersState } = await import('@discordjs/voice');
  return djsEntersState(connection, status, timeout);
}

// Auxiliar para criar embeds de informação
function createInfoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x1E90FF)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}
