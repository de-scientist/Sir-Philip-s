import { PrismaClient } from "@prisma/client";
import { startOfToday, startOfWeek, startOfMonth, subDays } from "date-fns";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

export const getDashboardMetrics = async (request, reply) => {
  try {
    logger.info("Fetching dashboard metrics");

    const today = startOfToday();
    const weekStart = startOfWeek(today);
    const monthStart = startOfMonth(today);
    const thirtyDaysAgo = subDays(today, 30);

    // Revenue Metrics
    const revenueMetrics = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: "completed",
      },
    });

    const todayRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: today,
        },
        status: "completed",
      },
    });

    const weeklyRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: weekStart,
        },
        status: "completed",
      },
    });

    const monthlyRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: "completed",
      },
    });

    // Order Metrics
    const orderMetrics = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    // Product Metrics
    const productMetrics = await prisma.product.aggregate({
      _count: true,
      where: {
        stock: {
          gt: 0,
        },
      },
    });

    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lte: 10,
          gt: 0,
        },
      },
    });

    const outOfStockProducts = await prisma.product.count({
      where: {
        stock: 0,
      },
    });

    // Customer Metrics
    const totalCustomers = await prisma.user.count({
      where: {
        role: "user",
      },
    });

    const newCustomers = await prisma.user.count({
      where: {
        role: "user",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    // Top Products - Fixed query
    const topProducts = await prisma.$transaction(async (tx) => {
      // First, get the top product IDs and their quantities
      const topSelling = await tx.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      });

      // Then, get the product details for these IDs
      const productIds = topSelling.map((item) => item.productId);
      const productDetails = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      // Combine the data
      return topSelling.map((item) => {
        const product = productDetails.find((p) => p.id === item.productId);
        return {
          id: product.id,
          name: product.name,
          sales: item._sum.quantity,
          stock: product.stock,
          price: product.currentPrice,
        };
      });
    });

    logger.info("Dashboard metrics fetched successfully");
    return reply.send({
      revenue: {
        total: revenueMetrics._sum.totalAmount || 0,
        today: todayRevenue._sum.totalAmount || 0,
        weekly: weeklyRevenue._sum.totalAmount || 0,
        monthly: monthlyRevenue._sum.totalAmount || 0,
      },
      orders: {
        total: orderMetrics.reduce((acc, curr) => acc + curr._count, 0),
        pending: orderMetrics.find((o) => o.status === "pending")?._count || 0,
        completed:
          orderMetrics.find((o) => o.status === "completed")?._count || 0,
        processing: 
        orderMetrics.find((o) => o.status === "processing")?._count ||  0,
        canceled:
          orderMetrics.find((o) => o.status === "canceled")?._count || 0,
      },
      products: {
        total: productMetrics._count,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customerName: `${order.user.firstname} ${order.user.lastname}`,
        amount: order.totalAmount,
        status: order.status,
        date: order.createdAt,
      })),
      topProducts,
    });
  } catch (error) {
    console.log(error)
    logger.error("Error fetching dashboard metrics", {
      error: error.message,
      stack: error.stack,
    });
    return reply.status(500).send({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred",});
  }
};
