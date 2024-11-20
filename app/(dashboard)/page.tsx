import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CreateTransactionDialog from './_components/CreateTransactionDialog';
import React from 'react'
import Overview from '@/app/(dashboard)/_components/Overview';
import History from './_components/History';

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {

    redirect('/wizard');

  }

  return (
    <div className="h-full bg-background ">
      <div className="border-b bg-card gap-6">
        <div className="relative flex flex-wrap items-center justify-between  py-8 px-8">
          <p className="text-3xl py-3 font-bold">Hello, {user.firstName}! 👋</p>
          <div className="flex items-center gap-3">
            <CreateTransactionDialog trigger={
              <Button variant={"outline"} className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
              >
                New Income 🤑
              </Button>
            }
              type="income"
            />
            <CreateTransactionDialog trigger={
              <Button variant={"outline"} className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
              >
                New Expense 🤑
              </Button>
            }
              type="expense"
            />
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />
      <History userSettings={userSettings} />
    </div>
  );
}

export default page