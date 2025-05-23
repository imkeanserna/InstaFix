import { PrismaClient } from '@prisma/client/edge'
import { getPrisma } from '../src';

const prisma: PrismaClient = getPrisma({ DATABASE_URL: process.env.DATABASE_URL! });
async function main() {
  console.log('Seeding categories and subcategories...');

  const categoriesData = [
    {
      name: 'Personal Services',
      subcategories: [
        { name: 'Life Coach' },
        { name: 'Psychologist' },
        { name: 'Hairstylist' },
        { name: 'Barber' },
        { name: 'Makeup Artist' },
        { name: 'Hairdresser' },
        { name: 'Tailor' },
        { name: 'Shoe Maker' },
      ],
    },
    {
      name: 'Technicians',
      subcategories: [
        { name: 'Electrical Technician' },
        { name: 'Electronics Technician' },
        { name: 'IT Technician' },
        { name: 'Mobile Repair Technician' },
        { name: 'Appliance Technician' },
        { name: 'Software Freelancer' },
      ],
    },
    {
      name: 'Mechanics',
      subcategories: [
        { name: 'Bicycle Mechanic' },
        { name: 'Auto Mechanic' },
        { name: 'Motorcycle Mechanic' },
        { name: 'Diesel Mechanic' },
      ],
    },
    {
      name: 'Transportation',
      subcategories: [
        { name: 'Taxi Driver' },
        { name: 'Bus Driver' },
        { name: 'Courier' },
        { name: 'Conductor' },
        { name: 'Traffic Engineer' },
      ],
    },
    {
      name: 'Animal Care',
      subcategories: [
        { name: 'Veterinarian' },
        { name: 'Pet Groomer' },
        { name: 'Dog Trainer' },
        { name: 'Zookeeper' },
        { name: 'Wildlife Biologist' },
      ],
    },
    {
      name: 'Sports and Recreation',
      subcategories: [
        { name: 'Sports Instructor' },
        { name: 'Professional Athlete' },
        { name: 'Sports Coach' },
        { name: 'Surfboard Shaper' },
        { name: 'Surf Instructor' },
        { name: 'Tennis Coach' },
        { name: 'Soccer Coach' },
        { name: 'Basketball Coach' },
        { name: 'Football Coach' },
        { name: 'Volleyball Coach' },
        { name: 'Table Tennis Coach' },
        { name: 'Rugby Coach' },
        { name: 'Cricket Coach' },
        { name: 'Golf Coach' },
      ],
    },
    {
      name: 'Creative Services',
      subcategories: [
        { name: 'Interior Designer' },
        { name: 'Furniture Designer' },
        { name: 'Car Designer' },
        { name: 'Event Caterer' },
        { name: 'Bartender' },
        { name: 'Chef' },
      ],
    },
    {
      name: 'Home and Garden',
      subcategories: [
        { name: 'Gardener' },
        { name: 'Horticulturist' },
        { name: 'Plumber' },
        { name: 'Carpenter' },
        { name: 'Furniture Maker' },
        { name: 'Painter' },
      ],
    },
  ];

  for (const categoryData of categoriesData) {
    const { name, subcategories } = categoryData;
    await prisma.category.create({
      data: {
        name,
        subcategories: {
          create: subcategories,
        },
      },
    });
  }

  console.log('Categories and subcategories seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
