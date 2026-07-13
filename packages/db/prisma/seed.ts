import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const venue = await prisma.venue.create({
    data: { name: 'DY Patil Stadium', city: 'Mumbai', address: 'Navi Mumbai, Maharashtra' },
  })

  await prisma.event.create({
    data: {
      title:    'Coldplay Music of the Spheres',
      category: 'CONCERT',
      venueId:  venue.id,
      dateTime: new Date('2026-12-01T19:00:00Z'),
      city:     'Mumbai',
      status:   'UPCOMING',
    },
  })

  console.log('Seeded successfully')
}

main().finally(() => prisma.$disconnect())
