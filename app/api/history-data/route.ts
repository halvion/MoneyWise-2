import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(3000),
  mode: z.enum(["Individual", "Family"]),
})

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const mode = searchParams.get("mode");

  const queryParams = getHistoryDataSchema.safeParse({
    timeframe,
    month,
    year,
    mode,
  })

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, { status: 400 });
  }

  const isIndividualMode = mode === 'Individual';

  let familyId = null;
  if (!isIndividualMode) {
    // Fetch the familyId for the user
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
    });

    if (!familyMember) {
      // TEMP FIX
      familyId = null;
      // return new Response(JSON.stringify({ error: "Family not found" }), { status: 404 });
    }

    else familyId = familyMember.familyId;
  }




  const data = await getHistoryData(user.id, queryParams.data.timeframe, {
    month: queryParams.data.month,
    year: queryParams.data.year,
  }, isIndividualMode, familyId);

  return Response.json(data);
}

export type GetHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>;

async function getHistoryData(
  userId: string,
  timeframe: Timeframe,
  period: Period,
  isIndividualMode: boolean,
  familyId: string | null
) {
  switch (timeframe) {
    case "year":
      return await getYearHistoryData(userId, period.year, isIndividualMode, familyId);
    case "month":
      return await getMonthHistoryData(userId, period.month, period.year, isIndividualMode, familyId);
  }
}

type HistoryData = {
  expense: number;
  income: number;
  month: number;
  year: number;
  day?: number;
}

async function getYearHistoryData(userId: string, year: number, isIndividualMode: boolean, familyId: string | null) {
  const result = await prisma.yearHistory.groupBy({
    by: ['month'],
    where: {
      year,
      AND: [
        isIndividualMode ? { userId: userId } : { familyId: familyId }
      ]
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: {
      month: 'asc',
    }
  })

  if (!result || result.length === 0) {
    return [];
  }

  /*
    We need to fill in the missing months with 0 values.
  */

  const history: HistoryData[] = [];
  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;

    const month = result.find((r) => r.month === i);
    if (month) {
      expense = month._sum.expense || 0;
      income = month._sum.income || 0;
    }

    history.push({
      year,
      month: i,
      expense,
      income,
    })
  }
  return history;
}

async function getMonthHistoryData(userId: string, month: number, year: number, isIndividualMode: boolean, familyId: string | null) {

  const result = await prisma.monthHistory.groupBy({
    by: ['day'],
    where: {
      month,
      year,
      AND: [
        isIndividualMode ? { userId } : { familyId }
      ]
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: {
      day: 'asc'
    }
  })
  if (!result || result.length === 0) {
    return [];
  }

  /*
    We need to fill in the missing days with 0 values.
  */

  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));
  for (let i = 1; i <= daysInMonth; i++) {
    let expense = 0;
    let income = 0;

    const day = result.find((r) => r.day === i);
    if (day) {
      expense = day._sum.expense || 0;
      income = day._sum.income || 0;
    }

    history.push({
      expense,
      income,
      month,
      year,
      day: i,
    })
  }
  return history;
}




