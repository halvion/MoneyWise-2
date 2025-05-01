import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");

  const validator = z.enum(["income", "expense"]).nullable();
  const queryParams = validator.safeParse(paramType);

  if (!queryParams.success) {
    return Response.json(queryParams.error, { status: 400 });
  }

  const type = queryParams.data;

  // Fetch user settings to determine if the user is in individual mode or family mode
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    return new Response(JSON.stringify({ error: "User settings not found" }), {
      status: 404,
    });
  }

  const isIndividualMode = userSettings.mode === "Individual";

  let familyMemberId = null;

  if (!isIndividualMode) {
    // Fetch the familyId for the user
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {
      // TEMPORARY FIX
      // return new Response(JSON.stringify({ error: "Family not found" }), { status: 404 });
      familyMemberId = null;
    } else familyMemberId = familyMember.familyId;
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
      ...(type && { type }), // include type in the filters if it's defined
      familyMemberId: familyMemberId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json(categories);
}
