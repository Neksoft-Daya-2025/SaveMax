import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { initModels, Contract, Payment } from "@/lib/initModels";
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

        // Active rental contracts (Rent or Lease) scoped to tenant
        const activeRentals = await Contract.find(applyTenantFilter(tenantContext, {
            type: { $in: ['Rent', 'Lease'] },
            status: 'Active'
        }));
        const expectedRent = activeRentals.reduce((acc, curr: any) => acc + (curr.details?.amount || 0), 0);
        const avgRent = activeRentals.length ? expectedRent / activeRentals.length : 0;

        // Completed rent payments in range scoped to tenant
        const rentPayments = await Payment.find(applyTenantFilter(tenantContext, {
            paymentType: { $in: ['Rent', 'Recurring'] },
            status: 'Completed',
            createdAt: { $gte: startDate, $lte: endDate }
        })).populate('property', 'title');

        const totalRentalIncome = rentPayments.reduce((acc, curr: any) => acc + (curr.amount || 0), 0);

        const monthsInRange = isMonthlyView ? 1 : 12;
        const expectedInRange = expectedRent * monthsInRange;
        const collectionRate = expectedInRange > 0 ? (totalRentalIncome / expectedInRange) * 100 : 0;

        // Trends (Monthly or Daily)
        let trends: any[] = [];
        if (isMonthlyView) {
            const daysInMonth = endDate.getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dStart = new Date(year, parseInt(monthParam!) - 1, i, 0, 0, 0);
                const dEnd = new Date(year, parseInt(monthParam!) - 1, i, 23, 59, 59);
                const dIncome = rentPayments.filter((p: any) => p.createdAt >= dStart && p.createdAt <= dEnd).reduce((a: number, c: any) => a + c.amount, 0);
                trends.push({ label: i.toString(), income: dIncome, expense: 0, profit: dIncome });
            }
        } else {
            const months = eachMonthOfInterval({ start: startDate, end: endDate });
            trends = months.map(m => {
                const mStart = startOfMonth(m);
                const mEnd = endOfMonth(m);
                const mIncome = rentPayments.filter((p: any) => p.createdAt >= mStart && p.createdAt <= mEnd).reduce((a: number, c: any) => a + c.amount, 0);
                return { label: format(m, "MMM"), income: mIncome, expense: 0, profit: mIncome };
            });
        }

        // Income by property
        const byProp: Record<string, number> = {};
        rentPayments.forEach((p: any) => {
            const name = p.property?.title || "Unknown";
            byProp[name] = (byProp[name] || 0) + (p.amount || 0);
        });
        const propertyBreakdown = Object.entries(byProp)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        return NextResponse.json({
            success: true,
            isMonthlyView,
            summary: {
                activeRentals: activeRentals.length,
                totalRentalIncome,
                expectedRent,
                avgRent,
                collectionRate
            },
            trends,
            propertyBreakdown
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
