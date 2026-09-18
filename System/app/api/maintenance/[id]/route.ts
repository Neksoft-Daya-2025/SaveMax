/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Maintenance from "@/models/Maintenance";
import { initModels } from "@/lib/initModels";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const maintenance = await Maintenance.findById(id)
            .populate('property')
            .populate('unit')
            .populate('assignedTo')
            .populate('requestedBy');

        if (!maintenance) {
            return NextResponse.json({ success: false, error: "Maintenance request not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: maintenance });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const body = await request.json();
        const cleanedBody = { ...body };

        if (cleanedBody.unit === "") delete cleanedBody.unit;
        if (cleanedBody.assignedTo === "") delete cleanedBody.assignedTo;
        if (cleanedBody.requestedBy === "") delete cleanedBody.requestedBy;

        const maintenance = await Maintenance.findByIdAndUpdate(id, cleanedBody, { new: true });
        if (!maintenance) {
            return NextResponse.json({ success: false, error: "Maintenance request not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: maintenance });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const maintenance = await Maintenance.findByIdAndDelete(id);
        if (!maintenance) {
            return NextResponse.json({ success: false, error: "Maintenance request not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Maintenance request deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
