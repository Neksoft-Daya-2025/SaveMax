/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { initModels } from "@/lib/initModels";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const inquiry = await Inquiry.findById(id).populate('property').populate('agent');
        if (!inquiry) {
            return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: inquiry });
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

        // Clean up optional ObjectIds sent as empty strings to avoid BSON errors
        const objectIdFields = ['property', 'unit', 'agent'];
        objectIdFields.forEach(field => {
            if (cleanedBody[field] === "") delete cleanedBody[field];
        });

        const inquiry = await Inquiry.findByIdAndUpdate(id, cleanedBody, { new: true });
        if (!inquiry) {
            return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: inquiry });
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
        const inquiry = await Inquiry.findByIdAndDelete(id);
        if (!inquiry) {
            return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
