import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const mode = searchParams.get("mode");



  const queryParam = OverviewQuerySchema.safeParse({ from, to, mode });
  if (!queryParam.success) {

    throw new Error(queryParam.error.message);
  }

  const isIndividualMode = queryParam.data.mode === "Individual";
  let familyId = null;

  if (!isIndividualMode) {
    // Fetch the familyId for the user
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {

      // TEMPORARY FIX
      // return new Response(JSON.stringify({ error: "Family not found" }), {
      //   status: 404,
      // });

      familyId = null;
    }

    else familyId = familyMember.familyId;

  }

  const stats = await getCategoriesStats(
    user.id,
    queryParam.data.from,
    queryParam.data.to,
    queryParam.data.mode,
    familyId
  );

  console.log("Stats:", stats); // Debugging log

  return new Response(JSON.stringify(stats), { status: 200 });
}

export type GetCategoriesStatsResponseType = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(
  userId: string,
  from: Date,
  to: Date,
  mode: string,
  familyId: string | null
) {
  const stats = await prisma.transaction.groupBy({
    by: ["type", "category", "categoryIcon"],
    where: {
      AND: [
        { date: { gte: from } },
        { date: { lte: to } },
        { userId: userId },
        { familyId: familyId },
        // temp fix because i havent set the function to delete the transaction if the category is deleted.
        {
          category: {
            in: (await prisma.category
              .findMany({
                select: { name: true },
              }))
              .map((category) => category.name),
          },
        },
      ],
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  return stats;
}
