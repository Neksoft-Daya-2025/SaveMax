import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { initModels, Payment } from "@/lib/initModels";
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

        const payments = await Payment.find(applyTenantFilter(tenantContext, {
            createdAt: { $gte: startDate, $lte: endDate }
        })).populate('property', 'title');

        const totalInvoiced = payments.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
        const completed = payments.filter((p: any) => p.status === 'Completed');
        const totalCollected = completed.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

        const pending = payments.filter((p: any) => p.status !== 'Completed');
        const totalPending = pending.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
        const totalFailed = pending.filter((p: any) => p.status === 'Failed').reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

        const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;

        // Trends (Monthly or Daily) — collections (completed payments)
        let trends: any[] = [];
        if (isMonthlyView) {
            const daysInMonth = endDate.getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dStart = new Date(year, parseInt(monthParam!) - 1, i, 0, 0, 0);
                const dEnd = new Date(year, parseInt(monthParam!) - 1, i, 23, 59, 59);
                const dCollected = completed.filter((p: any) => p.createdAt >= dStart && p.createdAt <= dEnd).reduce((a: number, c: any) => a + c.amount, 0);
                trends.push({ label: i.toString(), income: dCollected, expense: 0, profit: dCollected });
            }
        } else {
            const months = eachMonthOfInterval({ start: startDate, end: endDate });
            trends = months.map(m => {
                const mStart = startOfMonth(m);
                const mEnd = endOfMonth(m);
                const mCollected = completed.filter((p: any) => p.createdAt >= mStart && p.createdAt <= mEnd).reduce((a: number, c: any) => a + c.amount, 0);
                return { label: format(m, "MMM"), income: mCollected, expense: 0, profit: mCollected };
            });
        }

        // Breakdown by status
        const statusBreakdown = [
            { name: 'Collected', value: totalCollected },
            { name: 'Pending', value: pending.filter((p: any) => p.status === 'Pending').reduce((a: number, c: any) => a + (c.totalAmount || 0), 0) },
            { name: 'Failed', value: totalFailed }
        ];

        // Breakdown by payment type (collected only)
        const byType: Record<string, number> = {};
        completed.forEach((p: any) => {
            byType[p.paymentType] = (byType[p.paymentType] || 0) + (p.amount || 0);
        });
        const typeBreakdown = Object.entries(byType)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        return NextResponse.json({
            success: true,
            isMonthlyView,
            summary: {
                totalCollected,
                totalInvoiced,
                totalPending,
                totalFailed,
                collectionRate,
                transactionCount: payments.length
            },
            trends,
            statusBreakdown,
            typeBreakdown
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
