/* Developed by RUDRA via NEKLLM */
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { initModels } from "@/lib/initModels";
import { checkPermission } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'expenses', 'view');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const category = searchParams.get("category");

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        let query: any = {};

        if (search) {
            query.title = { $regex: escapeRegex(search), $options: "i" };
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (category) {
            query.category = category;
        }

        // Apply tenant isolation
        query = applyTenantFilter(session, query);

        const skip = (page - 1) * limit;

        const [expenses, total] = await Promise.all([
            Expense.find(query)
                .populate("recordedBy", "name")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            Expense.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: expenses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check Permissions
        const permissionError = await checkPermission(request, 'expenses', 'create');
        if (permissionError) return permissionError;

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        initModels();

        const body = await request.json();

        const expenseData = injectTenant(session, {
            ...body,
            recordedBy: session.user.id
        });

        const expense = await Expense.create(expenseData);

        return NextResponse.json({ success: true, data: expense }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to create expense" }, { status: 500 });
    }
}
