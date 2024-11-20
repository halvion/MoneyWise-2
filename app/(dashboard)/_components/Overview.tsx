"use client";

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { UserSettings } from '@prisma/client';
import { differenceInDays, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import StatsCards from './StatsCards';
import CategoriesStats from '@/app/(dashboard)/_components/CategoriesStats';

function Overview({ userSettings }: { userSettings: UserSettings }) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  return (
    <div className="gap-2">
      <div className="relative flex flex-wrap items-end justify-between py-6 px-8">
        <h2 className="text-3xl font bold">Overview</h2>
        <div className="flex items-center gap-2">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;
              // We update the date range only if both dates are set
              if (!from || !to) return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `The selected date range is too long. Please select a range of ${MAX_DATE_RANGE_DAYS} days or less.`
                )
              }
              setDateRange({ from, to })
            }}
          />
        </div>
      </div>
      <div className="relative gap-2 px-8">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />

        <CategoriesStats
           userSettings={userSettings}
           from={dateRange.from}
           to={dateRange.to}
        />
      </div>  
    </div>
  )
}

export default Overview