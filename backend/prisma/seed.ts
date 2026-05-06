import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Lucas Fernandes",
      email: "lucas@example.com",
      password,
    },
  });

  const javascriptCourse = await prisma.course.create({
    data: {
      name: "JavaScript Basics",
      description: "A course about JavaScript fundamentals.",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      creatorId: user.id,
    },
  });

  const reactCourse = await prisma.course.create({
    data: {
      name: "React Fundamentals",
      description: "A practical introduction to React and components.",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-04-01"),
      creatorId: user.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: "Introduction to JavaScript",
        status: "published",
        videoUrl: "https://example.com/javascript-introduction",
        courseId: javascriptCourse.id,
      },
      {
        title: "Variables and Types",
        status: "draft",
        videoUrl: "https://example.com/javascript-variables",
        courseId: javascriptCourse.id,
      },
      {
        title: "Introduction to React",
        status: "published",
        videoUrl: "https://example.com/react-introduction",
        courseId: reactCourse.id,
      },
      {
        title: "Components and Props",
        status: "draft",
        videoUrl: "https://example.com/react-components",
        courseId: reactCourse.id,
      },
    ],
  });

  console.log("Database seeded successfully.");
  console.log("Test user:");
  console.log("Email: lucas@example.com");
  console.log("Password: 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
