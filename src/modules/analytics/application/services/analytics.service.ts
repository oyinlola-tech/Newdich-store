import type { PrismaClient } from '@prisma/client';

export class AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async stats() {
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
      const count = row._count as { status?: number };
      acc[row.status] = Number(count.status ?? 0);
      return acc;
    }, {});

    return {
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
    };
  }

  async recentOrders(limit = 5) {
    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { id: true, name: true, quantity: true, total: true } }
      },
      orderBy: { placedAt: 'desc' },
      take: Math.min(limit, 50)
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      placedAt: order.placedAt,
      customer: order.user?.name ?? 'Unknown',
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));
  }

  async topProducts(limit = 10) {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: Math.min(limit, 50)
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: rows.map((row) => row.productId) } },
      select: { id: true, name: true, slug: true, price: true }
    });

    const byId = new Map(products.map((p) => [p.id, p]));
    return rows.map((row) => {
      const product = byId.get(row.productId);
      return {
        productId: row.productId,
        name: product?.name ?? 'Unknown',
        slug: product?.slug ?? '',
        unitsSold: row._sum.quantity ?? 0,
        revenue: Number(row._sum.total ?? 0)
      };
    });
  }

  async topCustomers(limit = 10) {
    const rows = await this.prisma.order.groupBy({
      by: ['userId'],
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: Math.min(limit, 50)
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: rows.map((row) => row.userId) } },
      select: { id: true, name: true, email: true }
    });

    const byId = new Map(users.map((u) => [u.id, u]));
    return rows.map((row) => {
      const user = byId.get(row.userId);
      return {
        userId: row.userId,
        name: user?.name ?? 'Unknown',
        email: user?.email ?? '',
        orders: row._count.id ?? 0,
        totalSpent: Number(row._sum.total ?? 0)
      };
    });
  }

  async salesSeries(days = 30) {
    const safeDays = Math.min(90, Math.max(7, days));
    const since = new Date();
    since.setDate(since.getDate() - (safeDays - 1));
    since.setHours(0, 0, 0, 0);

    const rows = await this.prisma.order.findMany({
      where: { status: { not: 'CANCELLED' }, placedAt: { gte: since } },
      select: { placedAt: true, total: true, status: true }
    });

    const labels: string[] = [];
    const revenue: number[] = [];
    const orders: number[] = [];
    const dayIndex = new Map<string, number>();

    for (let i = 0; i < safeDays; i++) {
      const date = new Date(since);
      date.setDate(since.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      labels.push(key);
      dayIndex.set(key, i);
      revenue.push(0);
      orders.push(0);
    }

    for (const row of rows) {
      const key = row.placedAt.toISOString().slice(0, 10);
      const index = dayIndex.get(key);
      if (index === undefined) continue;
      revenue[index] += Number(row.total);
      orders[index] += 1;
    }

    return {
      days: safeDays,
      series: labels.map((label, i) => ({ date: label, revenue: Math.round(revenue[i] * 100) / 100, orders: orders[i] }))
    };
  }
}
