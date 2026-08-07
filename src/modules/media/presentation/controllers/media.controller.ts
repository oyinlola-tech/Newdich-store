import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MediaService } from '../../application/services/media.service.js';

export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const parts = request.parts();
    const files: { buffer: Buffer; originalName: string; mimeType: string }[] = [];

    for await (const part of parts) {
      if (part.type === 'file') {
        files.push({
          buffer: await part.toBuffer(),
          originalName: part.filename ?? 'upload',
          mimeType: part.mimetype ?? 'application/octet-stream'
        });
      }
    }

    if (files.length === 0) {
      return reply.status(400).send({ message: 'No file uploaded.' });
    }

    const urls = await this.mediaService.saveFiles(files);
    return reply.status(201).send({ urls });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { url } = request.body as { url?: string };
    if (!url) {
      return reply.status(400).send({ message: 'url is required.' });
    }
    await this.mediaService.deleteByUrl(url);
    return reply.send({ message: 'File deleted successfully.' });
  }
}
