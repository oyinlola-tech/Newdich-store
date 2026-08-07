import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetCategoryTreeQuery } from './get-category-tree.query.js';
import type { CategoryService } from '../../services/category.service.js';
import type { Category } from '@prisma/client';

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export class GetCategoryTreeHandler implements QueryHandler<GetCategoryTreeQuery, CategoryTreeNode[]> {
  readonly queryName = GetCategoryTreeQuery.name;

  constructor(private readonly categoryService: CategoryService) {}

  async handle(): Promise<CategoryTreeNode[]> {
    const categories = await this.categoryService.listPublic();
    return buildTree(categories);
  }
}

function buildTree(categories: Category[]): CategoryTreeNode[] {
  const nodes = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
