import { EmbedBuilder } from 'discord.js';

// Cores padrão para o bot (Aesthetics Premium)
export const COLORS = {
  PRIMARY: 0x8A2BE2, // BlueViolet
  SUCCESS: 0x00FF7F, // SpringGreen
  ERROR: 0xFF4500,   // OrangeRed
  INFO: 0x1E90FF     // DodgerBlue
};

/**
 * Cria um embed básico de sucesso
 * @param {string} title
 * @param {string} description
 * @returns {EmbedBuilder}
 */
export function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Cria um embed básico de erro
 * @param {string} description
 * @returns {EmbedBuilder}
 */
export function createErrorEmbed(description) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle('❌ Erro')
    .setDescription(description)
    .setTimestamp();
}

/**
 * Cria um embed básico de informação
 * @param {string} title
 * @param {string} description
 * @returns {EmbedBuilder}
 */
export function createInfoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Retorna a cor da plataforma de origem (Aesthetics Premium)
 * @param {string} platform 
 * @returns {number}
 */
export function getPlatformColor(platform) {
  switch (platform) {
    case 'spotify':
      return 0x1DB954; // Verde Spotify
    case 'youtube':
      return 0xFF0000; // Vermelho YouTube
    case 'soundcloud':
      return 0xFF5500; // Laranja SoundCloud
    case 'deezer':
      return 0x00C7F2; // Azul Deezer
    default:
      return COLORS.PRIMARY;
  }
}

/**
 * Retorna o link do ícone da plataforma
 * @param {string} platform 
 * @returns {string|null}
 */
export function getPlatformIcon(platform) {
  switch (platform) {
    case 'spotify':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/120px-Spotify_icon.svg.png';
    case 'youtube':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/120px-YouTube_full-color_icon_%282017%29.svg.png';
    case 'soundcloud':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Soundcloud_logo.svg/120px-Soundcloud_logo.svg.png';
    case 'deezer':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Deezer_New_Icon.svg/120px-Deezer_New_Icon.svg.png';
    default:
      return null;
  }
}

/**
 * Retorna o rótulo formatado com ícone da plataforma de origem
 * @param {string} platform 
 * @returns {string}
 */
export function getPlatformLabel(platform) {
  switch (platform) {
    case 'youtube':
      return '🔴 YouTube';
    case 'spotify':
      return '🟢 Spotify';
    case 'soundcloud':
      return '🟠 SoundCloud';
    case 'deezer':
      return '🟣 Deezer';
    default:
      return '🔍 Busca';
  }
}

/**
 * Cria um embed detalhado para uma faixa de música
 * @param {object} track - Objeto de música formatado
 * @param {string} titlePrefix - Prefixo do título (ex: "Tocando agora", "Adicionado à Fila")
 * @param {object} [requestedBy] - Objeto do usuário { username, avatarURL } que solicitou
 * @param {object} [queueInfo] - Informações opcionais da fila { position, estimatedTimeLabel }
 * @returns {EmbedBuilder}
 */
export function createMusicEmbed(track, titlePrefix, requestedBy, queueInfo = null) {
  const platformColor = getPlatformColor(track.platform);
  const platformIcon = getPlatformIcon(track.platform);
  const platformLabel = getPlatformLabel(track.platform);

  const embed = new EmbedBuilder()
    .setColor(platformColor)
    .setAuthor({
      name: titlePrefix,
      iconURL: platformIcon || undefined
    })
    .setTitle(track.title)
    .setURL(track.url || 'https://www.youtube.com')
    .setTimestamp();

  if (track.thumbnail) {
    embed.setThumbnail(track.thumbnail);
  }

  // Se tivermos informações de fila (ex: quando adicionado por comando), cria o layout em grade (grid)
  if (queueInfo) {
    const positionVal = queueInfo.position === 1 ? 'Próxima' : `#${queueInfo.position}`;

    embed.addFields(
      { name: '⏱️ Tempo Estimado até Tocar', value: `\`${queueInfo.estimatedTimeLabel || 'Imediato'}\``, inline: true },
      { name: '🕒 Duração da Música', value: `\`${track.durationLabel || 'Live/Desconhecido'}\``, inline: true },
      { name: '\u200B', value: '\u200B', inline: false }, // Quebra de linha para alinhamento
      { name: '🔢 Posição na Fila', value: `\`${positionVal}\``, inline: true },
      { name: '🎵 Plataforma', value: platformLabel, inline: true }
    );
  } else {
    // Layout padrão simples (ex: Tocando agora)
    embed.setDescription(
      `**Artista/Canal:** \`${track.author || 'Desconhecido'}\`\n` +
      `**Duração:** \`${track.durationLabel || 'Live/Desconhecida'}\`\n` +
      `**Origem:** ${platformLabel}`
    );
  }

  if (requestedBy) {
    const requesterName = requestedBy.username || requestedBy;
    const requesterAvatar = requestedBy.avatarURL || null;
    embed.setFooter({
      text: `Solicitado por ${requesterName}`,
      iconURL: requesterAvatar
    });
  }

  return embed;
}
