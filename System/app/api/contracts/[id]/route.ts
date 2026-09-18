/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Contract from "@/models/Contract";
import { auth } from "@/auth";
import { initModels } from "@/lib/initModels";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();
        initModels();
        const { id } = await params;

        const contract = await Contract.findById(id)
            .populate('property', 'title location price areaSize areaUnit')
            .populate('unit', 'unitNumber floor block price areaSize')
            .populate('parties.owner', 'name email phone profileImage')
            .populate('parties.client', 'name email phone');

        if (!contract) {
            return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: contract });
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
        const payload = { ...body };

        // Clean up optional ObjectId fields if they are empty strings
        if (payload.unit === "") {
            payload.unit = null;
        } else if (payload.unit === undefined) {
            delete payload.unit;
        }

        if (payload.parties?.agent === "") {
            payload.parties.agent = null;
        }

        const contract = await Contract.findByIdAndUpdate(id, payload, { new: true });

        if (!contract) {
            return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: contract });
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

        const contract = await Contract.findByIdAndDelete(id);

        if (!contract) {
            return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Contract deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
