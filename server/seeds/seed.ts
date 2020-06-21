import { PrismaClient } from '@prisma/client';
import * as faker from 'faker';

const prisma = new PrismaClient();

const main = async () => {
  const user1 = await prisma.user.create({
    data: {
      bio: faker.lorem.sentences(2),
      email: faker.internet.email(),
      image: faker.image.avatar(),
      password: 'password',
      username: faker.internet.userName,
      role: 'ADMIN',
      //   favorites: [],
      //   followedBy: [],
      //   following: [],
      //   comments: [],
      //   articles: [],
    },
  });
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.disconnect();
  });
