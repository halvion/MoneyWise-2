"use server";

import prisma from "@/lib/prisma";
import { createTransactionSchema, createTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DateToUTCDate } from "@/lib/helpers";

export async function createTransaction(form: createTransactionSchemaType) {
  const parsedBody = createTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    redirect('/wizard');
  }

  const isIndividualMode = userSettings.mode === 'Individual';

  const { amount, category, date, description, type } = parsedBody.data;

  let familyId = null;

  if (!isIndividualMode) {
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {
      // TEMP FIX
      familyId = null;
      // throw new Error("Family not found");
    }

    else familyId = familyMember.familyId;
  }

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
      familyId: familyId,
    }
  });

  if (!categoryRow) {
    throw new Error("Category not found");
  }

  // NOTE: don't make confusion between $transaction (prisma) and prisma.transaction (table)



  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        familyId: familyId,
        amount,
        description: description || "",
        date,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
        type,
        isIndividual: isIndividualMode,
      },
    }),

    // Update monthly aggregates table
    prisma.monthHistory.upsert({
      where: {
        userId_day_month_year: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
        familyId: familyId,
      },
      create: {
        userId: user.id,
        familyId: familyId,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        income: type === 'income' ? amount : 0,
        expense: type === 'expense' ? amount : 0,
      },
      update: {
        income: {
          increment: type === 'income' ? amount : 0,
        },
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
      }
    }),

    // Update yearly aggregates table
    prisma.yearHistory.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
        familyId: familyId,
      },
      create: {
        userId: user.id,
        familyId: familyId,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        income: type === 'income' ? amount : 0,
        expense: type === 'expense' ? amount : 0,
      },
      update: {
        income: {
          increment: type === 'income' ? amount : 0,
        },
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
      }
    })
  ])

}