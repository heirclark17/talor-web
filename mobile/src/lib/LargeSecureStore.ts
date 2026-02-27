import * as SecureStore from 'expo-secure-store';

/**
 * LargeSecureStore adapter for Supabase auth
 *
 * expo-secure-store has a 2KB value limit. Supabase JWT sessions can exceed this.
 * This adapter chunks large values across multiple SecureStore keys.
 */
const CHUNK_SIZE = 1800; // Stay under 2KB limit with margin

function getChunkKey(key: string, index: number): string {
  return `${key}__chunk_${index}`;
}

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    // Try reading as a single value first
    const value = await SecureStore.getItemAsync(key);
    if (value === null) return null;

    // Check if it's chunked
    if (value.startsWith('__chunked__')) {
      const chunkCount = parseInt(value.replace('__chunked__', ''), 10);
      const chunks: string[] = [];
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await SecureStore.getItemAsync(getChunkKey(key, i));
        if (chunk === null) return null; // Corrupted, return null
        chunks.push(chunk);
      }
      return chunks.join('');
    }

    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    // Chunk the value
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }

    // Store chunk count as the main key
    await SecureStore.setItemAsync(key, `__chunked__${chunks.length}`);

    // Store each chunk
    await Promise.all(
      chunks.map((chunk, i) =>
        SecureStore.setItemAsync(getChunkKey(key, i), chunk)
      )
    );
  },

  async removeItem(key: string): Promise<void> {
    const value = await SecureStore.getItemAsync(key);

    if (value?.startsWith('__chunked__')) {
      const chunkCount = parseInt(value.replace('__chunked__', ''), 10);
      await Promise.all(
        Array.from({ length: chunkCount }, (_, i) =>
          SecureStore.deleteItemAsync(getChunkKey(key, i))
        )
      );
    }

    await SecureStore.deleteItemAsync(key);
  },
};
