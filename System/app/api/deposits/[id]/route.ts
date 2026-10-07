
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { initModels, Deposit } from "@/lib/initModels";
import { auth } from "@/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();
        initModels();
        const { id } = await params;

        const deposit = await Deposit.findById(id)
            .populate('property', 'title location price')
            .populate('unit', 'unitNumber floor block price')
            .populate('client', 'name email phone')
            .populate('contract')
            .populate('processedBy', 'name');

        if (!deposit) {
            return NextResponse.json({ success: false, error: "Deposit record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deposit });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        const { id } = await params;
        const body = await request.json();
        const cleanedBody = { ...body };
        if (cleanedBody.unit === "") cleanedBody.unit = null;
        if (cleanedBody.contract === "") cleanedBody.contract = null;
        if (cleanedBody.client === "") delete cleanedBody.client;
        if (cleanedBody.property === "") delete cleanedBody.property;

        const deposit = await Deposit.findByIdAndUpdate(id, cleanedBody, { new: true });

        if (!deposit) {
            return NextResponse.json({ success: false, error: "Deposit record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deposit });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        const { id } = await params;

        const deposit = await Deposit.findByIdAndDelete(id);

        if (!deposit) {
            return NextResponse.json({ success: false, error: "Deposit record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Deposit record deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
