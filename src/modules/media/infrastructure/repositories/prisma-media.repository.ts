import type { PrismaClient } from '@prisma/client';
import type { Media } from '@prisma/client';
import type { MediaRepositoryPort, SaveMediaInput } from '../../application/ports/media.repository.js';

export class PrismaMediaRepository implements MediaRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(input: SaveMediaInput): Promise<Media> {
    return this.prisma.media.create({ data: input });
  }

  findById(id: string): Promise<Media | null> {
    return this.prisma.media.findUnique({ where: { id } });
  }

  findByUrl(url: string): Promise<Media | null> {
    return this.prisma.media.findFirst({ where: { url } });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.media.delete({ where: { id } });
  }

  list(): Promise<Media[]> {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
