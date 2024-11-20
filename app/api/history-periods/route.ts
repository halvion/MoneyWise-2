import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
/*

  This function has no familyMode validation. It will return the history periods for the user.


*/

export async function GET(request: Request){
  const user = await currentUser();

  if(!user){
    redirect("/sign-in");
  }
  const periods = await getHistoryPeriods(user.id);
  return Response.json(periods);
}

export type GetHistoryPeriodsResponseType = Awaited<ReturnType<typeof getHistoryPeriods>>;

async function getHistoryPeriods(userId: string){

  const result = await prisma.monthHistory.findMany({
    where: {
      userId: userId
    },
    select:{
      year: true,
    },
    distinct: ['year'],
    orderBy: {
      year: 'asc'
    }
  })

  const years = result.map((r) => r.year);
  if(years.length === 0){
    return [new Date().getFullYear()];
  }
  return years;
}