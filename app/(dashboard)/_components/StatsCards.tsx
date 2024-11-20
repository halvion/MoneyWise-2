"use client";

import { GetBalanceStatsReponseType } from '@/app/api/stats/balance/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card } from '@/components/ui/card';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { UserSettings } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React, { ReactNode, useCallback, useMemo } from 'react'
import CountUp from 'react-countup';

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

function StatsCards({from, to, userSettings}: Props) {
  const userMode = userSettings.mode;
  const statsQuery = useQuery<GetBalanceStatsReponseType>({
    queryKey: ['stats', 'balance', from, to, userMode],
    queryFn: () => fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}&mode=${userSettings.mode}`)
    .then((res) => res.json()),
  })

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency)
  }, [userSettings.currency])

  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;

  const balance = income - expense;


  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard formatter={formatter}
          value={income}
          title="Income"
          icon={
            <TrendingUp className="text-emerald-500 bg-emerald-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard formatter={formatter}
          value={expense}
          title="Expense"
          icon={
            <TrendingDown className="text-red-500 bg-red-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard formatter={formatter}
          value={balance}
          title="Balance"
          icon={
            <Wallet className="text-violet-500 bg-violet-400/10" />
          }
        />
      </SkeletonWrapper>
    </div>
  )
}

export default StatsCards

function StatCard({formatter, value, title, icon} : {
  formatter: Intl.NumberFormat;
  value: number;
  title: string;
  icon: ReactNode;
}) {
  const formatFn = useCallback((value : number) => {
      return formatter.format(value);
    }, 
    [formatter]
  );
  return (
    <Card className='flex h-24 w-full items-center gap-2 p-4'>
      {icon}
      <div className="flex-col flex items-start gap=0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className='text-2xl'
        />
      </div>
    </Card>
  )
}