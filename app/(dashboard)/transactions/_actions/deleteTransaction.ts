"use server";

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

export async function DeleteTransaction(id: string) {
    const user = await currentUser();
    if(!user){
        redirect('/sign-in');
    }

    const transaction = await prisma.transaction.findUnique({
        where:{
            userId: user.id,
            id
        }
    })

    if(!transaction){
        throw new Error('Transaction not found');
    }

    await prisma.$transaction([
        // Delete transaction
        prisma.transaction.delete({
            where: {
                id
            }
        }),

        // Update monthHistory
        prisma.monthHistory.update({
            where: {
                userId_day_month_year: {
                    userId: user.id,
                    day: transaction.date.getUTCDate(),
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getFullYear(),
                }
            },
            data: {
                ...(transaction.type === 'expense' && {
                    expense: {
                        decrement: transaction.amount,
                    }
                }),
                ...(transaction.type === 'income' && {
                    income: {
                        decrement: transaction.amount,
                    }
                }),
            },
        }),

        // Update yearHistory
        prisma.yearHistory.update({
            where: {
                userId_month_year: {
                    userId: user.id,
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear(),
                }
            },
            data: {
                ...(transaction.type === 'expense' && {
                    expense: {
                        decrement: transaction.amount,
                    }
                }),
                ...(transaction.type === 'income' && {
                    income: {
                        decrement: transaction.amount,
                    }
                }),
            },
        })
    ])

}

