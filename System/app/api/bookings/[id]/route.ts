/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { User, Customer, Property } from "@/lib/initModels";
import Booking from "@/models/Booking";
import { initModels } from "@/lib/initModels";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const booking = await Booking.findById(id)
            .populate('property')
            .populate('customer')
            .populate('agent');
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: booking });
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
        const objectIdFields = ['customer', 'property', 'agent', 'unit'];
        objectIdFields.forEach(field => {
            if (cleanedBody[field] === "") delete cleanedBody[field];
        });

        const booking = await Booking.findByIdAndUpdate(id, cleanedBody, { new: true });
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: booking });
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
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Booking deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
