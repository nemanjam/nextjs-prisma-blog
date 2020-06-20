import next from 'next';
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bodyParser from 'body-parser';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await app.prepare();
    const prisma = new PrismaClient();
    const server = express();
    const router = express.Router();
    server.use(bodyParser.json());
    const apiRoutes = setRoutes(router, prisma);
    server.use('/api', apiRoutes); //

    server.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });
    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(
        `Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`
      );
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

const setRoutes = (router, prisma) => {
  router.post(`/user`, async (req, res) => {
    const result = await prisma.user.create({
      data: {
        ...req.body,
      },
    });
    res.json(result);
  });

  router.post(`/post`, async (req, res) => {
    const { title, content, authorEmail } = req.body;
    const result = await prisma.post.create({
      data: {
        title,
        content,
        published: false,
        author: { connect: { email: authorEmail } },
      },
    });
    res.json(result);
  });

  router.put('/publish/:id', async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: { published: true },
    });
    res.json(post);
  });

  router.delete(`/post/:id`, async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(post);
  });

  router.get(`/post/:id`, async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.findOne({
      where: {
        id: Number(id),
      },
    });
    res.json(post);
  });

  router.get('/feed', async (req, res) => {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: true },
    });
    res.json(posts);
  });

  router.get('/filterPosts', async (req, res) => {
    const { searchString }: { searchString?: string } = req.query;
    const draftPosts = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchString,
            },
          },
          {
            content: {
              contains: searchString,
            },
          },
        ],
      },
    });
    res.json(draftPosts);
  });
  return router;
};
