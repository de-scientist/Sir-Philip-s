import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/Logger.js";
import {
  productSchema,
  filterSchema,
  searchSchema,
  productsSchema,
} from "../middlewares/product.middleware.js";

const prisma = new PrismaClient();

export const createProduct = async (req, reply) => {
  try {
    const data = productSchema.parse(req.body);
    const { categoryId } = req.params;
    logger.info(`Creating new product in category ${categoryId}`);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        currentPrice: data.currentPrice,
        previousPrice: data.previousPrice,
        stock: data.stock,
        category: {
          connect: { id: categoryId },
        },
      },
      include: {
        category: true,
      },
    });
    logger.info(`Product created successfully with ID: ${product.id}`);
    reply.status(201).send(product);
  } catch (error) {
    logger.error(`Failed to create product: ${("Error :", error)}`);
    // reply.status(500).send({ message:" Failed to create a product." });
    reply.status(500).send(error);
  }
};

export const createMany = async (req, reply) => {
  try {
    const { categoryId } = req.params;
    const data = productsSchema.parse(req.body);
    logger.info(`Creating new products in category ${categoryId}`);

    const products = await prisma.product.createMany({
      data: data.map((product) => ({
        ...product,
        categoryId,
      })),
    });
    logger.info(`Products created successfully with IDs: ${categoryId}`);
    reply.status(200).send({ count: products.count });
  } catch (error) {
    logger.error(`Failed to create product: ${("Error :", error)}`);
    // reply.status(500).send({message: "Failed to create products."})
    reply.status(500).send(error);
  }
};

export const getProducts = async (req, reply) => {
  try {
    logger.info("Fetching all products");

    // Extract query parameters
    const {
      page = 1,
      limit = 50,
      sortBy = "name",
      order = "asc",
      minPrice,
      maxPrice,
    } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    // Validate pagination
    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber < 1 ||
      pageSize < 1
    ) {
      return reply
        .status(400)
        .send({ message: "Invalid pagination parameters" });
    }

    // Sorting options
    const validSortFields = ["name", "currentPrice", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    const sortOrder = order === "desc" ? "desc" : "asc";

    // Filtering options
    const priceFilter = {};
    if (minPrice) priceFilter.currentPrice = { gte: parseFloat(minPrice) };
    if (maxPrice)
      priceFilter.currentPrice = {
        ...priceFilter.currentPrice,
        lte: parseFloat(maxPrice),
      };

    // Fetch products with filters, sorting, and pagination
    const products = await prisma.product.findMany({
      where: priceFilter,
      include: {
        category: true,
      },
      orderBy: { [sortField]: sortOrder },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    // Get total count for pagination metadata
    const totalProducts = await prisma.product.count({ where: priceFilter });

    logger.info(`Fetched ${products.length} products`);
    reply.status(200).send({
      data: products,
      meta: {
        total: totalProducts,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalProducts / pageSize),
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch all products: ${error}`);
    reply.status(500).send({ message: "Failed to fetch products" });
  }
};

export const getProductById = async (req, reply) => {
  try {
    const productId = req.params.id;
    logger.info("Fetching product");

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      reply.status(404).send({ error: "Product not found" });
    } else {
      reply.status(200).send(product);
    }
    logger.info(`Product found ${product.id}`);
  } catch (error) {
    logger.error(`Failed to create product: ${("Error :", error)}`);
    reply.status(500).send({ message: "Failed to fetch product" });
  }
};

export const updateProduct = async (req, reply) => {
  try {
    const productId = req.params.id;
    const data = productSchema.parse(req.body);
    logger.info(`Updating an existing product ${productId}`);

    const product = await prisma.product.update({
      where: { id: productId },
      data: data,
    });
    logger.info(`Product successfully updated ${product}`);
    reply
      .status(200)
      .send({ message: "Product successfully updated", product });
  } catch (error) {
    logger.error(`Failed to create product: ${("Error :", error)}`);
    reply.status(500).send({ message: "Failed to update product" });
  }
};

export const filterProducts = async (req, reply) => {
  try {
    logger.info("Fetching all products");
    const query = filterSchema.parse(req.query);
    const { minPrice, maxPrice, category, stock } = query;

    const products = await prisma.product.findMany({
      where: {
        AND: [
          minPrice ? { currentPrice: { gte: parseFloat(minPrice) } } : {},
          maxPrice ? { currentPrice: { lte: parseFloat(maxPrice) } } : {},
          category ? { category: { name: category } } : {},
          stock ? { stock: { gte: parseInt(stock) } } : {},
        ],
      },
      orderBy: [{ currentPrice: "asc" }, { name: "asc" }],
    });

    if (products.length === 0) {
      reply
        .status(404)
        .send({
          message: "No products found matching the specified criteria.",
        });
    } else {
      reply.status(200).send(products);
    }
    logger.info(`Successfully fetched ${products.length} products`);
  } catch (error) {
    console.error("Error: ", error);
    logger.error(`Failed to filter product: ${("Error :", error)}`);
    reply.status(500).send({ message: "Failed to filter products" });
  }
};

export const searchProducts = async (req, reply) => {
  try {
    const { query } = searchSchema.parse(req.query);
    logger.info("Fetching searched products");

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
          { currentPrice: isNaN(Number(query)) ? undefined : Number(query) },
          { previousPrice: isNaN(Number(query)) ? undefined : Number(query) },
        ].filter(Boolean),
      },
      include: {
        category: true,
      },
    });

    if (products.length === 0) {
      reply
        .status(404)
        .send({ message: "No products found matching the search." });
    } else {
      reply.status(200).send(products);
    }
    logger.info(`Successfully fetched ${products.length} products`);
    reply.status(200).send(products);

    // Guide user by showing suggestion for similar products
    const suggestions = await prisma.product.findMany({
      where: {
        OR: [
          { name: { startsWith: query.substring(0, 3), mode: "insensitive" } },
          {
            category: {
              name: { startsWith: query.substring(0, 3), mode: "insensitive" },
            },
          },
        ],
      },
      take: 5,
      include: {
        category: true,
      },
    });

    if (suggestions.length > 0) {
      reply.status(200).send({
        message: "Did you mean:",
        suggestions: suggestions.map((s) => s.name),
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.status(400).send({ message: "Product is not available." });
    }
    logger.error(`Failed to search product: ${("Error :", error)}`);
    console.error("Error: ", error);
    reply.status(500).send({ error: error });
  }
};

export const deleteProduct = async (req, reply) => {
  try {
    const productId = req.params.id;
    logger.info(`Attempting to delete product with ID: ${productId}`);

    await prisma.product.delete({
      where: { id: productId },
    });
    logger.info(`Successfully deleted product with ID: ${productId}`);
    reply.status(200).send({ message: "Product is deleted successfully." });
  } catch (error) {
    logger.error(`Failed to delete product: ${("Error :", error)}`);
    reply.status(500).send({ error: "Failed to delete product" });
  }
};
