import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ArticleWhereInput, Enumerable } from '@prisma/client';

const prisma = new PrismaClient();

const articleAuthorSelect = {
  email: true,
  username: true,
  bio: true,
  image: true,
  followedBy: { select: { id: true } },
};

const commentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  body: true,
  author: { select: articleAuthorSelect },
};

const articleInclude = {
  author: { select: articleAuthorSelect },
  favoritedBy: { select: { id: true } },
};

// calculate following
const mapAuthorFollowing = (userId, { followedBy, ...rest }) => ({
  ...rest,
  following:
    Array.isArray(followedBy) && followedBy.map((f) => f.id).includes(userId),
});

// calculate following and favorited
const mapDynamicValues = (userId, { favoritedBy, author, ...rest }) => ({
  ...rest,
  favorited:
    Array.isArray(favoritedBy) && favoritedBy.map((f) => f.id).includes(userId),
  author: mapAuthorFollowing(userId, author),
});

const buildFindAllQuery = (query): Enumerable<ArticleWhereInput> => {
  const queries = [];

  if ('category' in query) {
    queries.push({
      categories: {
        some: {
          name: {
            equals: query.category,
          },
        },
      },
    });
  }

  if ('author' in query) {
    queries.push({
      author: {
        username: {
          equals: query.author,
        },
      },
    });
  }

  if ('favorited' in query) {
    queries.push({
      favoritedBy: {
        some: {
          username: {
            equals: query.favorited,
          },
        },
      },
    });
  }

  return queries;
};

/**
 * GET /api/articles?limit=20&offset=0&favorited=user0&author=user0&category=category0
 */
const findAll = async (req: Request, res: Response) => {
  //
  const andQueries = buildFindAllQuery(req.query);
  let articles = await prisma.article.findMany({
    where: { AND: andQueries },
    orderBy: { createdAt: 'desc' },
    include: articleInclude,
    ...('limit' in req.query ? { take: +req.query.limit } : { take: 20 }),
    ...('offset' in req.query ? { skip: +req.query.offset } : { skip: 0 }),
  });
  const articlesCount = await prisma.article.count({
    where: { AND: andQueries },
    orderBy: { createdAt: 'desc' },
  });
  const userId = 2; //logged in user
  articles = (articles as any).map((a) => mapDynamicValues(userId, a));

  res.json({ articles, articlesCount });
};

/**
 * GET /api?slug=slug
 */
const bySlug = async (req, res, next, slug) => {
  try {
    console.log('bySlug');
    const article = await prisma.article.findOne({
      where: {
        id: 1,
      },
      include: {
        author: true,
        categories: true,
        favoritedBy: true,
      },
    });
    res.json('slug');
  } catch (error) {
    next();
  }
};

export default {
  findAll,
  bySlug,
};
