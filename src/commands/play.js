import { SlashCommandBuilder , MessageFlags} from 'discord.js';
import play from 'play-dl';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import { queueManager } from '../music/QueueManager.js';
import { createSuccessEmbed, createErrorEmbed, createMusicEmbed } from '../utils/embeds.js';
import { formatDuration } from '../utils/formatter.js';
import fetch from 'isomorphic-unfetch';
import spotifyUrlInfo from 'spotify-url-info';

// Cacheia a verificação de disco para evitar I/O bloqueante a cada música
const HAS_COOKIES = fs.existsSync('./cookies.txt');

const { getData, getTracks } = spotifyUrlInfo(fetch);

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma música ou playlist do YouTube/Spotify')
    .addStringOption(option =>
      option
        .setName('busca')
        .setDescription('Link do YouTube/Spotify ou termo de pesquisa')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('busca');
    const voiceChannel = interaction.member.voice.channel;

    const requester = {
      username: interaction.user.username,
      avatarURL: interaction.user.displayAvatarURL({ dynamic: true })
    };

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('Você precisa estar em um canal de voz para usar este comando!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.reply({
        embeds: [createErrorEmbed('Eu não tenho permissão para conectar ou falar no seu canal de voz!')],
        flags: [MessageFlags.Ephemeral]
      });
    }

    await interaction.deferReply();

    const queue = queueManager.getQueue(interaction.guildId);
    let tracksToAdd = [];
    let isPlaylist = false;
    let playlistTitle = '';

    try {
      // Valida o link ou busca utilizando a função central do play-dl
      const validation = await play.validate(query);

      // 1. PLAYLIST DO YOUTUBE
      if (validation === 'yt_playlist') {
        const ytOptions = {
          dumpSingleJson: true,
          flatPlaylist: true,
          noWarnings: true,
          extractorArgs: 'youtube:player_client=android,web'
        };

        if (HAS_COOKIES) {
          ytOptions.cookies = './cookies.txt';
        }

        const playlistData = await youtubedl(query, ytOptions);

        if (!playlistData || !playlistData.entries) {
          throw new Error('Não foi possível obter os dados da playlist do YouTube.');
        }

        tracksToAdd = playlistData.entries.map(video => ({
          title: video.title || 'Música do YouTube',
          url: video.url || `https://www.youtube.com/watch?v=${video.id}`,
          duration: (video.duration || 0) * 1000,
          durationLabel: formatDuration((video.duration || 0) * 1000),
          thumbnail: video.thumbnails?.[0]?.url || null,
          author: video.uploader || 'Desconhecido',
          unresolved: false,
          platform: 'youtube',
          requestedBy: requester
        }));

        isPlaylist = true;
        playlistTitle = playlistData.title || 'Playlist do YouTube';
      }
      // 2. VÍDEO DO YOUTUBE
      else if (validation === 'yt_video') {
        const videoInfo = await play.video_info(query);
        const video = videoInfo.video_details;
        
        tracksToAdd.push({
          title: video.title,
          url: video.url,
          duration: video.durationInSec * 1000,
          durationLabel: formatDuration(video.durationInSec * 1000),
          thumbnail: video.thumbnails[0]?.url || null,
          author: video.channel?.name || 'Desconhecido',
          unresolved: false,
          platform: 'youtube',
          requestedBy: requester
        });
      }
      // 3. FAIXA DO SPOTIFY
      else if (validation === 'sp_track') {
        const spTrack = await getData(query);
        const durationMs = spTrack.duration || 0;
        tracksToAdd.push({
          title: spTrack.title || spTrack.name,
          author: spTrack.artists?.map(a => a.name).join(', ') || 'Desconhecido',
          duration: durationMs,
          durationLabel: formatDuration(durationMs),
          thumbnail: spTrack.coverArt?.sources?.[0]?.url || spTrack.visualIdentity?.image?.[0]?.url || null,
          url: null,
          unresolved: true,
          platform: 'spotify',
          requestedBy: requester
        });
      }
      // 4. PLAYLIST OU ÁLBUM DO SPOTIFY
      else if (validation === 'sp_playlist' || validation === 'sp_album') {
        const spData = await getData(query);
        let spTracks;
        try {
            spTracks = await getTracks(query);
        } catch (e) {
            // Se getTracks falhar, tentar usar a trackList de getData
            spTracks = spData.trackList || [];
        }
        
        tracksToAdd = spTracks.map(t => {
          const durationMs = t.duration || 0;
          return {
            title: t.name || t.title,
            author: t.artists?.map(a => a.name).join(', ') || t.artist || 'Desconhecido',
            duration: durationMs,
            durationLabel: formatDuration(durationMs),
            thumbnail: t.thumbnail?.url || spData.coverArt?.sources?.[0]?.url || null,
            url: null,
            unresolved: true,
            platform: 'spotify',
            requestedBy: requester
          };
        });

        isPlaylist = true;
        playlistTitle = spData.name || spData.title;
      }
      // 5. FAIXA DO SOUNDCLOUD
      else if (validation === 'so_track') {
        const soTrack = await play.soundcloud(query);
        const duration = soTrack.durationInMs || (soTrack.duration * 1000) || 0;
        
        tracksToAdd.push({
          title: soTrack.name || soTrack.title,
          url: soTrack.url,
          duration: duration,
          durationLabel: formatDuration(duration),
          thumbnail: soTrack.thumbnail || soTrack.artwork_url || null,
          author: soTrack.user?.username || 'Desconhecido',
          unresolved: false,
          platform: 'soundcloud',
          requestedBy: requester
        });
      }
      // 6. PLAYLIST DO SOUNDCLOUD
      else if (validation === 'so_playlist') {
        const soPlaylist = await play.soundcloud(query);
        const soTracks = await soPlaylist.all_tracks();
        
        tracksToAdd = soTracks.map(t => {
          const duration = t.durationInMs || (t.duration * 1000) || 0;
          return {
            title: t.name || t.title,
            url: t.url,
            duration: duration,
            durationLabel: formatDuration(duration),
            thumbnail: t.thumbnail || t.artwork_url || null,
            author: t.user?.username || 'Desconhecido',
            unresolved: false,
            platform: 'soundcloud',
            requestedBy: requester
          };
        });

        isPlaylist = true;
        playlistTitle = soPlaylist.name;
      }
      // 7. FAIXA DO DEEZER
      else if (validation === 'dz_track') {
        const dzTrack = await play.deezer(query);
        tracksToAdd.push({
          title: dzTrack.title,
          author: dzTrack.artist?.name || 'Desconhecido',
          duration: dzTrack.duration * 1000,
          durationLabel: formatDuration(dzTrack.duration * 1000),
          thumbnail: dzTrack.album?.cover_medium || dzTrack.album?.cover || null,
          url: null,
          unresolved: true,
          platform: 'deezer',
          requestedBy: requester
        });
      }
      // 8. PLAYLIST OU ÁLBUM DO DEEZER
      else if (validation === 'dz_playlist' || validation === 'dz_album') {
        const dzData = await play.deezer(query);
        const dzTracks = await dzData.all_tracks();
        
        tracksToAdd = dzTracks.map(t => ({
          title: t.title,
          author: t.artist?.name || 'Desconhecido',
          duration: t.duration * 1000,
          durationLabel: formatDuration(t.duration * 1000),
          thumbnail: t.album?.cover_medium || t.album?.cover || null,
          url: null,
          unresolved: true,
          platform: 'deezer',
          requestedBy: requester
        }));

        isPlaylist = true;
        playlistTitle = dzData.name;
      }
      // 9. BUSCA TEXTUAL DO YOUTUBE (OU OUTROS LINKS NÃO SUPORTADOS)
      else {
        const searchResults = await play.search(query, { limit: 1 });
        
        if (!searchResults || searchResults.length === 0) {
          return interaction.editReply({
            embeds: [createErrorEmbed(`Nenhuma música encontrada para a busca: \`${query}\``)]
          });
        }

        const video = searchResults[0];
        tracksToAdd.push({
          title: video.title,
          url: video.url,
          duration: video.durationInSec * 1000,
          durationLabel: formatDuration(video.durationInSec * 1000),
          thumbnail: video.thumbnails[0]?.url || null,
          author: video.channel?.name || 'Desconhecido',
          unresolved: false,
          platform: 'search',
          requestedBy: requester
        });
      }

      if (tracksToAdd.length === 0) {
        return interaction.editReply({
          embeds: [createErrorEmbed('Não foi possível carregar as músicas deste link.')]
        });
      }

      // Adiciona na fila e conecta na call se necessário
      queue.join(voiceChannel, interaction.channel);
      
      const wasEmpty = queue.tracks.length === 0 && !queue.currentTrack;

      if (isPlaylist) {
        queue.addTracks(tracksToAdd);
        await interaction.editReply({
          embeds: [createSuccessEmbed('Playlist Adicionada', `Adicionadas **${tracksToAdd.length}** músicas da playlist **${playlistTitle}** à fila.`)]
        });
      } else {
        const track = tracksToAdd[0];
        queue.addTrack(track);
        
        // Se a fila estava vazia, ela já começa a tocar imediatamente e envia o embed "Tocando Agora".
        // Caso contrário, enviamos o embed de "Adicionado à fila".
        if (!wasEmpty) {
          const position = queue.tracks.length;
          const estimatedTimeMs = queue.getEstimatedTimeUntil(position - 1);
          const estimatedTimeLabel = formatDuration(estimatedTimeMs);

          await interaction.editReply({
            embeds: [createMusicEmbed(track, 'Adicionado à Fila', track.requestedBy, {
              position,
              estimatedTimeLabel
            })]
          });
        } else {
          await interaction.editReply({
            embeds: [createSuccessEmbed('Reproduzindo', `Iniciando a reprodução de **${track.title}**.`)]
          });
        }
      }

    } catch (error) {
      console.error('Erro no comando play:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed(`Ocorreu um erro ao tentar processar sua solicitação: ${error.message}`)]
      });
    }
  }
};
