import { PrismaClient } from '@prisma/client';
import * as faker from 'faker';

const prisma = new PrismaClient();

const main = async () => {
  //

  for (const tableName of ['User', 'Article', 'Comment', 'Category']) {
    await prisma.executeRaw(`DELETE FROM "${tableName}";`);
  }

  // create 3 users
  [...Array.from(Array(3).keys())].map(async (index) => {
    let role = 'USER';

    if (index === 0) {
      role = 'ADMIN';
    }

    const user = await prisma.user.create({
      data: {
        bio: faker.lorem.sentences(2),
        image: faker.image.avatar(),
        username: `user${index}`,
        email: `email${index}@email.com`,
        password: '123456789',
        role: role,
        //   favorites: [],
        //   followedBy: [],
        //   following: [],
        //   comments: [],
        //   articles: [],
      },
    });
  });

  // create 9 articles
  const users = await prisma.user.findMany();

  [...Array.from(Array(9).keys())].map(async (index) => {
    //
    const j = Math.floor(index / 3);
    const user = users[j];

    const article = await prisma.article.create({
      data: {
        slug: faker.lorem.slug(),
        title: faker.lorem.sentence(),
        description: faker.lorem.sentences(3),
        body: faker.lorem.paragraphs(3),
        author: {
          connect: { email: user.email },
        },
        // favoritedBy []
        // comments    []
        // categories
      },
    });
  });
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.disconnect();
  });
