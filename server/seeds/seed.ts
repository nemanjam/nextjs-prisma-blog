import { PrismaClient } from '@prisma/client';
import * as faker from 'faker';

const prisma = new PrismaClient();

const main = async () => {
  console.log(faker.name.findName());
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.disconnect();
  });
