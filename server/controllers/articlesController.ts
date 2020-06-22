import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/articles
 */
const get = async (req: Request, res: Response) => {
  const articles = await prisma.article.findMany({
    include: { author: true, comments: true },
  });
  res.json(articles);
};

export default {
  get,
};
