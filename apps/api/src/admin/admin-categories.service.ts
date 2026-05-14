import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AdminCategoryInput, AdminCategoryNode } from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";
import { slugify } from "./admin.utils";

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listTree(): Promise<AdminCategoryNode[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
      },
    });

    return this.buildTree(categories);
  }

  async create(input: AdminCategoryInput): Promise<AdminCategoryNode> {
    const slug = input.slug ?? slugify(input.name);
    await this.ensureUniqueSlug(slug);
    await this.ensureParentExists(input.parentId ?? null);

    const category = await this.prisma.category.create({
      data: {
        name: input.name,
        slug,
        parentId: input.parentId ?? null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
      },
    });

    return { ...category, children: [] };
  }

  async update(id: string, input: AdminCategoryInput): Promise<AdminCategoryNode> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Không tìm thấy danh mục.");
    }

    const slug = input.slug ?? slugify(input.name);
    if (slug !== existing.slug) {
      await this.ensureUniqueSlug(slug, id);
    }

    const parentId = input.parentId ?? null;
    if (parentId === id) {
      throw new BadRequestException("Danh mục không thể là cha của chính nó.");
    }

    await this.ensureParentExists(parentId);

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        parentId,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
      },
    });

    return { ...category, children: [] };
  }

  async remove(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Không tìm thấy danh mục.");
    }

    const childCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException("Không thể xóa danh mục còn danh mục con.");
    }

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new BadRequestException("Không thể xóa danh mục đang có sản phẩm.");
    }

    await this.prisma.category.delete({ where: { id } });
    return { id };
  }

  private buildTree(
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      parentId: string | null;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): AdminCategoryNode[] {
    const nodes = new Map<string, AdminCategoryNode>(
      categories.map((category) => [category.id, { ...category, children: [] }]),
    );
    const roots: AdminCategoryNode[] = [];

    for (const category of categories) {
      const node = nodes.get(category.id);
      if (!node) {
        continue;
      }

      if (category.parentId && nodes.has(category.parentId)) {
        nodes.get(category.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Slug danh mục đã tồn tại.");
    }
  }

  private async ensureParentExists(parentId: string | null): Promise<void> {
    if (!parentId) {
      return;
    }

    const parent = await this.prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException("Danh mục cha không tồn tại.");
    }
  }
}
