const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('User model fields:', Object.keys(prisma.user))
  // We can't easily check types at runtime like this for count, 
  // but we can try to run a query.
  try {
    const user = await prisma.user.findFirst({
      select: {
        _count: {
          select: { contacts: true, journals: true }
        }
      }
    })
    console.log('Query successful:', user)
  } catch (e) {
    console.error('Query failed:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
