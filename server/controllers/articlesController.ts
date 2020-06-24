import { Request, Response } from 'express';
import { PrismaClient, ArticleWhereInput, Enumerable } from '@prisma/client';
const slug = require('slug');

const prisma = new PrismaClient();

const userId = 2; //logged in user

const slugify = (title: string) => {
  return (
    slug(title, { lower: true }) +
    '-' +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
  );
};

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
  categories: { select: { name: true } },
};

// calculate following
const mapAuthorFollowing = (userId, { followedBy, ...rest }) => ({
  ...rest,
  following:
    Array.isArray(followedBy) && followedBy.map((f) => f.id).includes(userId),
});

// calculate following and favorited
const mapDynamicValues = (
  userId,
  { favoritedBy, author, categories, ...rest }
) => ({
  ...rest,
  favorited:
    Array.isArray(favoritedBy) && favoritedBy.map((f) => f.id).includes(userId),
  author: mapAuthorFollowing(userId, author),
  categories: categories.map((c) => c.name),
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

  articles = (articles as any).map((a) => mapDynamicValues(userId, a));

  res.json({ articles, articlesCount });
};

/**
 * GET /api/articles/:slug
 */
const findOne = async (req, res) => {
  let article: any = await prisma.article.findOne({
    where: { slug: req.params.slug },
    include: articleInclude,
  });
  article = mapDynamicValues(userId, article);
  res.json({ article });
};

/**
 * GET /api/articles/feed
 */
const findFeed = async (req, res) => {
  const where = {
    author: {
      followedBy: { some: { id: +userId } },
    },
  };
  let articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: articleInclude,
    ...('limit' in req.query ? { take: +req.query.limit } : { take: 20 }),
    ...('offset' in req.query ? { skip: +req.query.offset } : { skip: 0 }),
  });
  const articlesCount = await prisma.article.count({
    where,
    orderBy: { createdAt: 'desc' },
  });
  articles = (articles as any).map((a) => mapDynamicValues(userId, a));
  res.json({ articles, articlesCount });
};

/**
 * POST /api/articles
 */
const create = async (req, res) => {
  const data = {
    title: req.body.title,
    description: req.body.description,
    body: req.body.body,
    slug: slugify(req.body.title),
    categories: {
      connect: {
        name: req.body.categoryName, // this should be array, check if category exists
      },
    },
    author: {
      connect: { id: userId },
    },
  };
  let article: any = await prisma.article.create({
    data,
    include: articleInclude,
  });
  article = mapDynamicValues(userId, article);
  res.json({ article });
};

/**
 * PUT /api/articles/:slug
 */
const update = async (req, res) => {
  let article: any = await prisma.article.update({
    where: { slug: req.params.slug },
    data: {
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      categories: { set: { name: req.body.categoryName } }, // this should be string array
      updatedAt: new Date(),
    },
    include: articleInclude,
  });
  article = mapDynamicValues(userId, article);
  return res.json({ article });
};

/**
 * DELETE /api/articles/:slug
 */
const deleteArticle = async (req, res) => {
  let article: any = await prisma.article.delete({
    where: { slug: req.params.slug },
    include: articleInclude,
  });
  article = mapDynamicValues(userId, article);
  return res.json({ article });
};

/**
 * POST /api/articles/:slug/favorite
 */
const favorite = async (req, res) => {
  let article: any = await prisma.article.update({
    where: { slug: req.params.slug },
    data: {
      favoritedBy: {
        connect: { id: userId },
      },
    },
    include: articleInclude,
  });
  article = mapDynamicValues(userId, article);
  res.json({ article });
};

/**
 * DELETE /api/articles/:slug/favorite
 */
const unFavorite = async (req, res) => {
  let article: any = await prisma.article.update({
    where: { slug: req.params.slug },
    data: {
      favoritedBy: {
        disconnect: { id: userId },
      },
    },
    include: articleInclude,
  });
  article = mapDynamicValues(userId, article);
  res.json({ article });
};

export default {
  findOne,
  findAll,
  findFeed,
  create,
  update,
  deleteArticle,
  favorite,
  unFavorite,
};
