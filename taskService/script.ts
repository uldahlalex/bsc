import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
await prisma.task.create({
    data: {
      title: "do something",
      desc: "now",
      authorId: 1
    }
  })
  const tasks = await prisma.task.findMany()
  console.dir(tasks, { depth: null })
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
