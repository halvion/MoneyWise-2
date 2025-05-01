import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request){
  const user = await currentUser();
  if(!user){
    redirect('/sign-in');
  }
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const mode = searchParams.get('mode');

  const queryParam = OverviewQuerySchema.safeParse({from, to, mode});

  if(!queryParam.success){
    return Response.json(queryParam.error.message, {status: 400});
  }

  const isIndividualMode = mode === 'Individual';
  let familyId = null;

  if (!isIndividualMode) {
    // Fetch the familyId for the user
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {
      // TEMPORARY FIX
      // return new Response(JSON.stringify({ error: "Family not found" }), { status: 404 });
      familyId = null;
    }

    else familyId = familyMember.familyId;
  }

  const stats = await getBalanceStats(user.id, queryParam.data.from, queryParam.data.to, isIndividualMode, familyId);

  return Response.json(stats);
}

export type GetBalanceStatsReponseType = Awaited<ReturnType<typeof getBalanceStats>>;

async function getBalanceStats(userId: string, from: Date, to: Date, isIndividualMode: boolean, familyId: string | null){
  const totals = await prisma.transaction.groupBy({
    by: ['type'],
    where:{
      AND: [
        { date: { gte: from } },
        { date: { lte: to } },
        isIndividualMode ? { userId: userId } : { familyId: familyId }
      ]
    },
    _sum: {
      amount: true
    },
  })
  return {
    expense: totals.find(t => t.type === 'expense')?._sum.amount || 0,
    income: totals.find(t => t.type === 'income')?._sum.amount || 0,
  }
}