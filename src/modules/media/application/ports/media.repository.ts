import type { Media } from '@prisma/client';

export interface SaveMediaInput {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  alt?: string;
}

export interface MediaRepositoryPort {
  save(input: SaveMediaInput): Promise<Media>;
  findById(id: string): Promise<Media | null>;
  findByUrl(url: string): Promise<Media | null>;
  deleteById(id: string): Promise<void>;
  list(): Promise<Media[]>;
}
