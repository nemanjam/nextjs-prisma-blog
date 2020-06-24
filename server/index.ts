import next from 'next';
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bodyParser from 'body-parser';

import apiRoutes from './routes';
import seed from './seeds/seed';
import listEndpoints from 'express-list-endpoints';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;

const prisma = new PrismaClient();

(async () => {
  try {
    await seed(false);
    await nextApp.prepare();
    const app = express();
    app.use(bodyParser.json());
    app.use('/api', apiRoutes);

    app.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    app.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(
        `Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`
      );
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.disconnect();
  }
})();
