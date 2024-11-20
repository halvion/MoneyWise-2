"use server";

import prisma from "@/lib/prisma";
import { CreateCategorySchema, CreateCategorySchemaType, DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form);

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

  let familyId = null;

  if (!isIndividualMode) {
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {
      // throw new Error("Family not found");
      // TEMP FIX
      familyId = null;
    }

    else familyId = familyMember.familyId;
  }

  const { name, icon, type } = parsedBody.data;
  const category = await prisma.category.create({
    data: {
      userId: user.id,
      familyId: familyId,
      name,
      icon,
      type,
    }
  });
  return category;
}

export async function DeleteCategory(form: DeleteCategorySchemaType){
  const parsedBody = DeleteCategorySchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    redirect("/wizard");
  }

  const isIndividualMode = userSettings.mode === "Individual";

  let familyId = null;

  if (!isIndividualMode) {
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {
      // throw new Error("Family not found");
      // TEMP FIX
      familyId = null;
    } else familyId = familyMember.familyId;
  }

  const category = await prisma.category.findUnique({
    where: {
      name_userId_type: {
        userId: user.id,
        name: parsedBody.data.name,
        type: parsedBody.data.type,
      },
    },
  });

  if (category && category.familyId === familyId) {
    return await prisma.category.delete({
      where: {
        name_userId_type: {
          userId: user.id,
          name: parsedBody.data.name,
          type: parsedBody.data.type,
        },
      },
    });
  }
  else throw new Error("Failed to delete");
}

