import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import type { SaveFileInput, StoredFile, StoragePort } from '../../application/ports/storage.port.js';
import { appConfig } from '../../../config/index.js';

export class LocalStorageProvider implements StoragePort {
  private readonly directory: string;

  constructor(directory: string = join(process.cwd(), 'uploads')) {
    this.directory = directory;
  }

  async save(input: SaveFileInput): Promise<StoredFile> {
    await mkdir(this.directory, { recursive: true });
    const extension = extname(input.originalName).toLowerCase() || '.bin';
    const filename = `${Date.now()}-${randomUUID()}${extension}`;
    const filePath = join(this.directory, filename);
    await writeFile(filePath, input.buffer);

    return {
      filename,
      url: `${appConfig.PUBLIC_BASE_URL}/uploads/${filename}`,
      mimeType: input.mimeType,
      size: input.buffer.length
    };
  }

  async delete(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (!filename) return;
    await unlink(join(this.directory, filename)).catch(() => undefined);
  }
}
