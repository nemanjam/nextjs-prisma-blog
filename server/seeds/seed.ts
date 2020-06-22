import { PrismaClient } from '@prisma/client';
import * as faker from 'faker';

const prisma = new PrismaClient();

const resetDatabase = async () => {
  for (const tableName of ['Article', 'User', 'Comment', 'Category']) {
    await prisma.executeRaw(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`
    );
  }
};

const createUsers = async () => {
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
        //   // comments: [],
        //   // articles: [],
      },
    });
    return user;
  });

  await Promise.all(userPromises);
};

const favoriteArticles = async () => {
  const articles = await prisma.article.findMany();

  // admin favorites all articles
  await prisma.user.update({
    where: { id: 1 },
    data: {
      favorites: {
        connect: [
          ...articles.map((a) => ({
            id: a.id,
          })),
        ],
      },
    },
  });
};

const followUsers = async () => {
  const users = await prisma.user.findMany();

  // admin follows first user
  await prisma.user.update({
    where: { id: 1 },
    data: {
      following: {
        connect: {
          id: users[2].id,
        },
      },
    },
  });

  // all follow admin
  users.map(async (user, index) => {
    if (index === 0) return;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        following: {
          connect: {
            id: users[0].id,
          },
        },
      },
    });
  });
};

const createArticles = async () => {
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
        // //comments    []
        // categories
      },
    });
    return article;
  });

  await Promise.all(articlePromises);
};

const addArticleToCategory = async () => {
  const categories = await prisma.category.findMany();

  // add one article per category, 1 in 1, 2 in 2...
  const articlePromises = categories.map((c) => {
    return prisma.article.update({
      where: { id: c.id },
      data: {
        categories: {
          connect: { id: c.id },
        },
      },
    });
  });
  await Promise.all(articlePromises); // required!!!
};

const createComments = async () => {
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

  await Promise.all(commentPromises);
};

const createCategories = async () => {
  // create 3 categories
  const categoryPromises = [...Array.from(Array(3).keys())].map((index) => {
    //
    const category = prisma.category.create({
      data: {
        name: `category${index}`,
      },
    });
    return category;
  });

  await Promise.all(categoryPromises);
};

const main = async () => {
  // create models
  await resetDatabase();
  await createUsers();
  await createArticles();
  await createComments();
  await createCategories();

  // relations
  await followUsers();
  await favoriteArticles();
  await addArticleToCategory();

  // const x = await prisma.article
  //   .findOne({
  //     where: {
  //       id: 1,
  //     },
  //   })
  //   .categories();
  // console.log(x);
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.disconnect();
  });
