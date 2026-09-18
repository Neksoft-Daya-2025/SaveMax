/* Developed by RUDRA via NEKLLM */
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Payroll, Staff } from "@/lib/initModels";
import { startOfMonth, endOfMonth } from "date-fns";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { auth } from "@/auth";

// GET /api/payroll - List all payroll records
export async function GET(request: Request) {
    try {
        await connectToDB();

        const session: any = await auth();
        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const staffId = searchParams.get("staff");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        let query: any = {};
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (staffId) query.staff = staffId;

        if (search) {
            const staffQuery = applyTenantFilter(session, {
                name: { $regex: search, $options: "i" }
            });
            const staffMembers = await Staff.find(staffQuery).select("_id");
            query.staff = { $in: staffMembers.map(s => s._id) };
        }

        query = applyTenantFilter(session, query);
        const skip = (page - 1) * limit;

        const [payrolls, total, allPayrolls] = await Promise.all([
            Payroll.find(query)
                .populate("staff", "name email phone")
                .sort({ year: -1, month: -1 })
                .skip(skip)
                .limit(limit),
            Payroll.countDocuments(query),
            Payroll.find(query) // For stats
        ]);

        const stats = {
            totalPayout: allPayrolls.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
            pendingPayout: allPayrolls.filter(p => p.status !== 'paid').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
            totalBonuses: allPayrolls.reduce((acc, curr) => acc + (curr.bonuses || 0), 0),
        };

        return NextResponse.json({
            success: true,
            data: payrolls,
            stats,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// POST /api/payroll - Generate payroll
export async function POST(request: Request) {
    try {
        await connectToDB();
        const session: any = await auth();
        const body = await request.json();
        const { staffId, month, year } = body;

        if (!staffId || !month || !year) {
            return NextResponse.json({ success: false, error: "staffId, month, and year are required" }, { status: 400 });
        }

        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(yearNum)) {
            return NextResponse.json({ success: false, error: "Invalid month or year" }, { status: 400 });
        }

        const monthName = MONTH_NAMES[monthNum - 1] || `Month ${monthNum}`;

        // Handle "ALL" staff generation
        if (staffId === "ALL") {
            const staffList = await Staff.find(applyTenantFilter(session, { isActive: { $ne: false } }));
            if (!staffList || staffList.length === 0) {
                return NextResponse.json({ success: false, error: "No active staff members found" }, { status: 404 });
            }

            let createdCount = 0;
            let updatedCount = 0;
            let skippedPaidCount = 0;

            for (const s of staffList) {
                const baseSalary = s.salary || 0;
                const existing = await Payroll.findOne({
                    staff: s._id,
                    month: monthNum,
                    year: yearNum
                });

                if (existing) {
                    if (existing.status === 'paid') {
                        skippedPaidCount++;
                        continue;
                    }
                    // Update existing draft
                    existing.baseSalary = baseSalary;
                    existing.totalAmount = baseSalary + (existing.totalCommission || 0) + (existing.totalTips || 0) + (existing.bonuses || 0) - (existing.deductions || 0);
                    if (session?.user?.organizationId && !existing.organization) {
                        existing.organization = session.user.organizationId;
                    }
                    await existing.save();
                    updatedCount++;
                } else {
                    const payload = injectTenant(session, {
                        staff: s._id,
                        month: monthNum,
                        year: yearNum,
                        baseSalary,
                        totalCommission: 0,
                        totalTips: 0,
                        bonuses: 0,
                        deductions: 0,
                        totalAmount: baseSalary,
                        status: "draft",
                        breakdown: {},
                    });
                    await Payroll.create(payload);
                    createdCount++;
                }
            }

            return NextResponse.json({
                success: true,
                message: `Payroll processed for ${monthName} ${yearNum}: ${createdCount} created, ${updatedCount} updated${skippedPaidCount > 0 ? `, ${skippedPaidCount} skipped (already paid)` : ''}.`
            });
        }

        // Single Staff Member
        const staff = await Staff.findById(staffId);
        if (!staff) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });

        const baseSalary = staff.salary || 0;

        // Check if payroll already exists for this staff member in this month/year
        const existingPayroll = await Payroll.findOne({
            staff: staffId,
            month: monthNum,
            year: yearNum
        });

        if (existingPayroll) {
            if (existingPayroll.status === 'paid') {
                return NextResponse.json({
                    success: false,
                    error: `A paid payroll record for ${staff.name} for ${monthName} ${yearNum} already exists and cannot be regenerated.`
                }, { status: 400 });
            }

            if (existingPayroll.status === 'approved') {
                return NextResponse.json({
                    success: false,
                    error: `An approved payroll record for ${staff.name} for ${monthName} ${yearNum} already exists. Please review or edit it from the list.`
                }, { status: 400 });
            }

            // If draft, update the base salary & recalculate total
            existingPayroll.baseSalary = baseSalary;
            existingPayroll.totalAmount = baseSalary + (existingPayroll.totalCommission || 0) + (existingPayroll.totalTips || 0) + (existingPayroll.bonuses || 0) - (existingPayroll.deductions || 0);
            if (session?.user?.organizationId && !existingPayroll.organization) {
                existingPayroll.organization = session.user.organizationId;
            }
            await existingPayroll.save();

            return NextResponse.json({
                success: true,
                data: existingPayroll,
                message: `Existing draft payroll for ${staff.name} (${monthName} ${yearNum}) has been updated.`
            });
        }

        // Create new draft payroll
        const payload = injectTenant(session, {
            staff: staffId,
            month: monthNum,
            year: yearNum,
            baseSalary,
            totalCommission: 0,
            totalTips: 0,
            bonuses: 0,
            deductions: 0,
            totalAmount: baseSalary,
            status: "draft",
            breakdown: {},
        });

        const payroll = await Payroll.create(payload);

        return NextResponse.json({ success: true, data: payroll }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                error: "A payroll record for this staff member for the selected month and year already exists."
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || "Failed to generate payroll" }, { status: 500 });
    }
}
