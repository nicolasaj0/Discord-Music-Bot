import { GuildQueue } from './GuildQueue.js';

class QueueManager {
  constructor() {
    this.queues = new Map();
  }

  /**
   * Obtém a fila de reprodução de um servidor, criando uma nova se não existir.
   * @param {string} guildId 
   * @returns {GuildQueue}
   */
  getQueue(guildId) {
    let queue = this.queues.get(guildId);
    if (!queue) {
      queue = new GuildQueue(guildId, this);
      this.queues.set(guildId, queue);
    }
    return queue;
  }

  /**
   * Exclui a fila de reprodução de um servidor.
   * @param {string} guildId 
   */
  deleteQueue(guildId) {
    this.queues.delete(guildId);
  }
}

// Exporta uma única instância global (Singleton)
export const queueManager = new QueueManager();
