const prisma = require("./config/database");

async function testDatabase() {
  const users = await prisma.user.findMany();

  console.log(users);
}

testDatabase();
