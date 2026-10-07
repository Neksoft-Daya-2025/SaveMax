import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { initModels, Payment, Payroll, Expense, Commission } from "@/lib/initModels";
import { startOfYear, endOfYear, startOfMonth, endOfMonth, eachMonthOfInterval, format } from "date-fns";
import { getTenantContext, applyTenantFilter, getTenantTimezone } from "@/lib/tenant";
import { getYearInTimezone } from "@/lib/dateUtils";

export async function GET(request: Request) {
    try {
        await connectToDB();
        initModels();

        const tenantContext = await getTenantContext(request as any);
        const tenantTimezone = await getTenantTimezone(tenantContext);

        const { searchParams } = new URL(request.url);
        const defaultYear = getYearInTimezone(new Date(), tenantTimezone);
        const year = parseInt(searchParams.get("year") || defaultYear.toString());
        const monthParam = searchParams.get("month"); // 1-12

        let startDate, endDate, isMonthlyView = false;

        if (monthParam && monthParam !== "all") {
            const m = parseInt(monthParam);
            startDate = startOfMonth(new Date(year, m - 1));
            endDate = endOfMonth(new Date(year, m - 1));
            isMonthlyView = true;
        } else {
            startDate = startOfYear(new Date(year, 0, 1));
            endDate = endOfYear(new Date(year, 0, 1));
        }

        // Fetch all relevant data scoped to tenant
        const [payments, payrolls, expenses, commissions] = await Promise.all([
            Payment.find(applyTenantFilter(tenantContext, { createdAt: { $gte: startDate, $lte: endDate }, status: "Completed" })),
            Payroll.find(applyTenantFilter(tenantContext, { createdAt: { $gte: startDate, $lte: endDate }, status: "paid" })),
            Expense.find(applyTenantFilter(tenantContext, { date: { $gte: startDate, $lte: endDate } })),
            Commission.find(applyTenantFilter(tenantContext, { createdAt: { $gte: startDate, $lte: endDate }, status: "Paid" }))
        ]);

        // Calculate Totals
        const totalIncome = payments.reduce((acc, curr) => acc + curr.amount, 0);
        const totalPayroll = payrolls.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const totalCommissions = commissions.reduce((acc, curr) => acc + curr.amount, 0);

        const totalOutflow = totalPayroll + totalExpenses + totalCommissions;
        const netProfit = totalIncome - totalOutflow;

        // Calculate Trends (Monthly or Daily)
        let trends: any[] = [];

        if (isMonthlyView) {
            // Daily Trends for specific month
            const daysInMonth = endDate.getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dStart = new Date(year, parseInt(monthParam!) - 1, i, 0, 0, 0);
                const dEnd = new Date(year, parseInt(monthParam!) - 1, i, 23, 59, 59);

                const dIncome = payments.filter(p => p.createdAt >= dStart && p.createdAt <= dEnd).reduce((a, c) => a + c.amount, 0);
                const dPayroll = payrolls.filter(p => p.createdAt >= dStart && p.createdAt <= dEnd).reduce((a, c) => a + c.totalAmount, 0);
                const dExpenses = expenses.filter(e => e.date >= dStart && e.date <= dEnd).reduce((a, c) => a + c.amount, 0);
                const dCommissions = commissions.filter(c => c.createdAt >= dStart && c.createdAt <= dEnd).reduce((a, c) => a + c.amount, 0);

                const dOutflow = dPayroll + dExpenses + dCommissions;

                trends.push({
                    label: i.toString(),
                    income: dIncome,
                    expense: dOutflow,
                    profit: dIncome - dOutflow
                });
            }
        } else {
            // Monthly Trends for the year
            const months = eachMonthOfInterval({ start: startDate, end: endDate });
            trends = months.map(m => {
                const mStart = startOfMonth(m);
                const mEnd = endOfMonth(m);

                const mIncome = payments.filter(p => p.createdAt >= mStart && p.createdAt <= mEnd).reduce((a, c) => a + c.amount, 0);
                const mPayroll = payrolls.filter(p => p.createdAt >= mStart && p.createdAt <= mEnd).reduce((a, c) => a + c.totalAmount, 0);
                const mExpenses = expenses.filter(e => e.date >= mStart && e.date <= mEnd).reduce((a, c) => a + c.amount, 0);
                const mCommissions = commissions.filter(c => c.createdAt >= mStart && c.createdAt <= mEnd).reduce((a, c) => a + c.amount, 0);

                const mOutflow = mPayroll + mExpenses + mCommissions;

                return {
                    label: format(m, "MMM"),
                    income: mIncome,
                    expense: mOutflow,
                    profit: mIncome - mOutflow
                };
            });
        }

        // 🟢 Category Breakdown (Expenses)
        const expenseCategories: Record<string, number> = {};
        expenses.forEach(e => {
            expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
        });

        return NextResponse.json({
            success: true,
            isMonthlyView,
            summary: {
                totalIncome,
                totalPayroll,
                totalExpenses,
                totalCommissions,
                totalOutflow,
                netProfit,
                profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
            },
            trends,
            expenseBreakdown: Object.entries(expenseCategories).map(([name, value]) => ({ name, value }))
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
