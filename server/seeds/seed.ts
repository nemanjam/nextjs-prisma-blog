import { PrismaClient } from '@prisma/client';
import * as faker from 'faker';

const prisma = new PrismaClient();

const main = async () => {
  //

  for (const tableName of ['Article', 'User', 'Comment', 'Category']) {
    await prisma.executeRaw(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`
    );
  }

  // create 3 users
  const userPromises = [...Array.from(Array(3).keys())].map((index) => {
    let role = 'USER';

    if (index === 0) {
      role = 'ADMIN';
    }

    const user = prisma.user.create({
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
    return user;
  });

  await Promise.all([...userPromises]);

  // create 9 articles
  const users = await prisma.user.findMany();
  const articlePromises = [...Array.from(Array(9).keys())].map((index) => {
    //
    const j = Math.floor(index / 3);
    const user = users[j];

    const article = prisma.article.create({
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
    return article;
  });

  await Promise.all([...articlePromises]);

  // create 27 comments
  const articles = await prisma.article.findMany();
  const commentPromises = [...Array.from(Array(27).keys())].map((index) => {
    //
    const j = Math.floor(index / 3);
    const article = articles[j];

    const comment = prisma.comment.create({
      data: {
        body: faker.lorem.sentences(2),
        article: { connect: { id: article.id } },
        author: {
          connect: { id: article.authorId },
        },
      },
    });
    return comment;
  });

  await Promise.all([...commentPromises]);
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.disconnect();
  });
