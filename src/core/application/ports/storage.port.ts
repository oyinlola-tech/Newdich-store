export interface StoredFile {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface SaveFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoragePort {
  save(input: SaveFileInput): Promise<StoredFile>;
  delete(url: string): Promise<void>;
}
