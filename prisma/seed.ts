import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "sirazfe@gmail.com" },
    update: {},
    create: {
      email: "sirazfe@gmail.com",
      firstName: "Sirazul",
      lastName: "Islam",
      password: hashedPassword,
      isAdmin: true,
    },
  });
  console.log("Seeded user:", user);

  // Seed categories
  const categories = [
    {
      name: "T-Shirt",
      slug: "t-shirt",
      image: "assets/img/shop/category-thumb-1.jpg",
    },
    {
      name: "Bags",
      slug: "bags",
      image: "assets/img/shop/category-thumb-2.jpg",
    },
    {
      name: "Sandal",
      slug: "sandal",
      image: "assets/img/shop/category-thumb-3.jpg",
    },
    {
      name: "Scarf Cap",
      slug: "scarf-cap",
      image: "assets/img/shop/category-thumb-4.jpg",
    },
    {
      name: "Shoes",
      slug: "shoes",
      image: "assets/img/shop/category-thumb-5.jpg",
    },
    {
      name: "Pillowcase",
      slug: "pillowcase",
      image: "assets/img/shop/category-thumb-6.jpg",
    },
    {
      name: "Jumpsuits",
      slug: "jumpsuits",
      image: "assets/img/shop/category-thumb-7.jpg",
    },
    {
      name: "Hats",
      slug: "hats",
      image: "assets/img/shop/category-thumb-8.jpg",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("Seeded categories");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
