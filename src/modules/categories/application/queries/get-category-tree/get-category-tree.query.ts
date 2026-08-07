import { Query } from '../../../../../core/application/queries/query.js';
import type { CategoryTreeNode } from './get-category-tree.handler.js';

export class GetCategoryTreeQuery extends Query<CategoryTreeNode[]> {}
