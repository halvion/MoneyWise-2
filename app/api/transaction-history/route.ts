import { GetFormatterForCurrency } from "@/lib/helpers";
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request){
  const user = await currentUser();

  if(!user){
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  // const mode = searchParams.get("mode");
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });
  if(!userSettings){
    throw new Error("User settings not found" );
  }
  const mode = userSettings.mode;
  const currency = userSettings.currency;
  

  const isIndividualMode = mode === 'Individual';
  let familyId = null;
  if(!isIndividualMode){
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if(!familyMember){
      // TEMPORARY FIX
      // return new Response(JSON.stringify({ error: "Family not found" }), { status: 404 });
      familyId = null;
    }

    else familyId = familyMember.familyId;
  }

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
    mode,
  });

  if(!queryParams.success){
    return Response.json(queryParams.error.message, { status: 400 });
  }

  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to,
    isIndividualMode,
    familyId,
    currency
  )
  
  return Response.json(transactions);
}

export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionsHistory>>;

async function getTransactionsHistory(userId: string, from: Date, to: Date, isIndividualMode: boolean, familyId: string | null, currency: string){

  const formatter = GetFormatterForCurrency(currency);


  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
      date: {
        gte: from,
        lte: to,
      },
      // TEMP FIX
      // isIndividual: isIndividualMode,
      AND: [
        isIndividualMode ? { userId: userId } : { familyId: familyId }
      ]
    },
    orderBy: {
      date: 'desc'
    }
  });

  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount),
  }));
}