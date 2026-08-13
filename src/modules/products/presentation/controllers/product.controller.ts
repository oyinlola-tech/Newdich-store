import type { FastifyReply, FastifyRequest } from 'fastify';
import { CommandBus } from '../../../../core/application/commands/command-bus.js';
import { QueryBus } from '../../../../core/application/queries/query-bus.js';
import { parseBody } from '../../../../core/infrastructure/http/parse.js';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { CategoryRepositoryPort } from '../../../categories/application/ports/category.repository.js';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command.js';
import { UpdateProductCommand } from '../../application/commands/update-product/update-product.command.js';
import { DeleteProductCommand } from '../../application/commands/delete-product/delete-product.command.js';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query.js';
import { GetProductQuery } from '../../application/queries/get-product/get-product.query.js';
import { SearchProductsQuery } from '../../application/queries/search-products/search-products.query.js';
import { createProductValidator, updateProductValidator } from '../validators/product.validator.js';
import { toProductOutput } from '../serializers/product.serializer.js';
import type { MediaService } from '../../../media/application/services/media.service.js';
import type { SearchLogService } from '../../../search/application/services/search-log.service.js';
import { IMAGE_UPLOAD_ERROR_MESSAGE, isAllowedImage } from '../../../../core/shared/media/image-types.js';

export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mediaService: MediaService,
    private readonly categoryRepository: CategoryRepositoryPort,
    private readonly searchLogService: SearchLogService
  ) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as {
      featured?: string;
      category?: string;
      brand?: string;
      search?: string;
      minPrice?: string;
      maxPrice?: string;
      discounted?: string;
      sort?: string;
      page?: string;
      limit?: string;
    };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const categoryId = query.category ? (await this.resolveCategoryByName(query.category)) ?? undefined : undefined;

    const result = await this.queryBus.execute(
      new GetProductsQuery({
        featured: query.featured === 'true' ? true : undefined,
        categoryId,
        brandId: query.brand ?? undefined,
        search: query.search?.trim() || undefined,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        discounted: query.discounted === 'true' ? true : undefined,
        sort: query.sort as 'price_asc' | 'price_desc' | 'featured' | 'newest' | undefined,
        page,
        limit
      })
    );

    return reply.send({
      products: result.products.map(toProductOutput),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { idOrSlug } = request.params as { idOrSlug: string };
    const product = await this.queryBus.execute(new GetProductQuery(idOrSlug));
    return reply.send({ product: toProductOutput(product) });
  }

  async search(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { q?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);

    if (query.q?.trim()) {
      await this.searchLogService.log(query.q, request.user?.id);
    }

    const result = await this.queryBus.execute(
      new SearchProductsQuery({ search: query.q?.trim() || undefined, page, limit })
    );

    return reply.send({
      products: result.products.map(toProductOutput),
      total: result.total,
      page,
      limit
    });
  }

  async suggestions(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { q?: string; limit?: string };
    const term = query.q?.trim() || '';
    const limit = Math.min(10, Math.max(1, Number(query.limit ?? 5)));

    if (!term) {
      return reply.send({ suggestions: [] });
    }

    const products = await this.queryBus.execute(
      new SearchProductsQuery({ search: term, page: 1, limit })
    );

    const suggestions = products.products.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || null
    }));

    return reply.send({ suggestions });
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { search?: string; status?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);

    const result = await this.queryBus.execute(
      new GetProductsQuery({
        search: query.search?.trim() || undefined,
        status: query.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | undefined,
        page,
        limit
      })
    );

    return reply.send({
      products: result.products.map(toProductOutput),
      total: result.total,
      page,
      limit
    });
  }

  async adminGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const product = await this.queryBus.execute(new GetProductQuery(id));
    return reply.send({ product: toProductOutput(product) });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    let parsed: Awaited<ReturnType<ProductController['parseBodyWithFiles']>>;
    try {
      parsed = await this.parseBodyWithFiles(request);
    } catch (error) {
      if (error instanceof InvalidImageTypeError) {
        return reply.status(400).send({ message: error.message });
      }
      throw error;
    }
    const dto = parseBody(createProductValidator, parsed.fields);
    if (parsed.files.length > 10) {
      return reply.status(400).send({ message: 'A product can have at most 10 images.' });
    }
    const imageUrls = await this.saveImages(parsed.files, dto.images);
    if (imageUrls.length === 0) {
      return reply.status(400).send({ message: 'At least one product image is required.' });
    }

    const product = await this.commandBus.execute(
      new CreateProductCommand({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        categoryName: dto.category,
        brandId: dto.brandId,
        brandName: dto.brand,
        stock: dto.stock ?? 0,
        featured: dto.featured === true || dto.featured === 'true',
        status: dto.status,
        images: imageUrls
      })
    );

    return reply.status(201).send({ product: toProductOutput(product) });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    let parsed: Awaited<ReturnType<ProductController['parseBodyWithFiles']>>;
    try {
      parsed = await this.parseBodyWithFiles(request);
    } catch (error) {
      if (error instanceof InvalidImageTypeError) {
        return reply.status(400).send({ message: error.message });
      }
      throw error;
    }
    const dto = parseBody(updateProductValidator, parsed.fields);
    const imageUrls = parsed.files.length > 0 ? await this.saveImages(parsed.files, []) : dto.images;

    const product = await this.commandBus.execute(
      new UpdateProductCommand(id, {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        categoryName: dto.category,
        brandId: dto.brandId,
        brandName: dto.brand,
        stock: dto.stock,
        featured: dto.featured === true || dto.featured === 'true',
        status: dto.status,
        ...(imageUrls !== undefined ? { images: imageUrls } : {})
      })
    );

    return reply.send({ product: toProductOutput(product) });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.commandBus.execute(new DeleteProductCommand(id));
    return reply.send({ message: 'Product deleted successfully.' });
  }

  private async resolveCategoryByName(name: string): Promise<string | null> {
    const category = await this.categoryRepository.findByName(name);
    return category?.id ?? null;
  }

  private async saveImages(files: ParsedFile[], existing?: string[]): Promise<string[]> {
    if (files.length > 0) {
      return this.mediaService.saveFiles(files);
    }
    return existing ?? [];
  }

  private async parseBodyWithFiles(request: FastifyRequest): Promise<{
    fields: Record<string, unknown>;
    files: ParsedFile[];
  }> {
    const contentType = request.headers['content-type'] ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return { fields: request.body as Record<string, unknown>, files: [] };
    }

    const parts = request.parts();
    const fields: Record<string, unknown> = {};
    const files: ParsedFile[] = [];

    for await (const part of parts) {
      if (part.type === 'file') {
        const file: ParsedFile = {
          buffer: await part.toBuffer(),
          originalName: part.filename ?? 'upload',
          mimeType: part.mimetype ?? 'application/octet-stream'
        };
        if (!isAllowedImage(file)) {
          throw new InvalidImageTypeError();
        }
        files.push(file);
      } else {
        const value = part.value as string;
        if (part.fieldname in fields && Array.isArray(fields[part.fieldname])) {
          (fields[part.fieldname] as string[]).push(value);
        } else if (part.fieldname in fields) {
          fields[part.fieldname] = [fields[part.fieldname], value];
        } else {
          fields[part.fieldname] = value;
        }
      }
    }

    return { fields, files };
  }
}

export interface ParsedFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export class InvalidImageTypeError extends Error {
  constructor() {
    super(IMAGE_UPLOAD_ERROR_MESSAGE);
  }
}
