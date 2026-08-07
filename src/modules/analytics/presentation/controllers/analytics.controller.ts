import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';

export class AnalyticsController {
  constructor(private readonly prisma: PrismaClient) {}

  async stats(_request: FastifyRequest, reply: FastifyReply) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalCustomers,
      revenue,
      monthRevenue,
      weekRevenue,
      ordersByStatus,
      lowStockCount,
      pendingReturns,
      unreadContact,
      todayOrders
    ] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' }, placedAt: { gte: startOfMonth } }
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' }, placedAt: { gte: startOfWeek } }
      }),
      this.prisma.order.groupBy({ by: ['status'], _count: true, orderBy: { _count: { status: 'desc' } } }),
      this.prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
      this.prisma.return.count({ where: { status: 'REQUESTED' } }),
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
      this.prisma.order.count({ where: { placedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } })
    ]);

    const statusCounts = ordersByStatus.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = Number((row._count as { status?: number }).status ?? 0);
      return acc;
    }, {});

    return reply.send({
      totalOrders,
      totalProducts,
      totalUsers,
      totalCustomers,
      totalRevenue: Number(revenue._sum.total ?? 0),
      monthRevenue: Number(monthRevenue._sum.total ?? 0),
      weekRevenue: Number(weekRevenue._sum.total ?? 0),
      todayOrders,
      ordersByStatus: statusCounts,
      lowStockCount,
      pendingReturns,
      unreadContact
    });
  }

  async recentOrders(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string };
    const limit = Math.min(Number(query.limit ?? 5) || 5, 50);

    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { id: true, name: true, quantity: true, total: true } }
      },
      orderBy: { placedAt: 'desc' },
      take: limit
    });

    return reply.send({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        placedAt: order.placedAt,
        customer: order.user?.name ?? 'Unknown',
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
      }))
    });
  }

  async topProducts(_request: FastifyRequest, reply: FastifyReply) {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: rows.map((row) => row.productId) } },
      select: { id: true, name: true, slug: true, price: true }
    });

    const byId = new Map(products.map((p) => [p.id, p]));
    return reply.send({
      products: rows.map((row) => {
        const product = byId.get(row.productId);
        return {
          productId: row.productId,
          name: product?.name ?? 'Unknown',
          slug: product?.slug ?? '',
          unitsSold: row._sum.quantity ?? 0,
          revenue: Number(row._sum.total ?? 0)
        };
      })
    });
  }
}
