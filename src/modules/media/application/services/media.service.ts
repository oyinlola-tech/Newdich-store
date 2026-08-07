import type { MediaRepositoryPort } from '../ports/media.repository.js';
import type { StoragePort } from '../../../../core/application/ports/storage.port.js';
import { appConfig } from '../../../../config/index.js';

export interface FileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepositoryPort,
    private readonly storage: StoragePort
  ) {}

  async saveFiles(files: FileInput[]): Promise<string[]> {
    if (files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const stored = await this.storage.save(file);
      const media = await this.mediaRepository.save({
        filename: stored.filename,
        originalName: file.originalName,
        mimeType: stored.mimeType,
        size: stored.size,
        url: stored.url
      });
      urls.push(media.url);
    }
    return urls;
  }

  async getPublicUrl(filename: string): Promise<string> {
    return `${appConfig.PUBLIC_BASE_URL}/uploads/${filename}`;
  }

  async deleteByUrl(url: string): Promise<void> {
    await this.storage.delete(url);
    const media = await this.mediaRepository.findByUrl(url);
    if (media) {
      await this.mediaRepository.deleteById(media.id);
    }
  }
}
