/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Customer, Property } from "@/lib/initModels";
import Payment from "@/models/Payment";
import { initModels } from "@/lib/initModels";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const payment = await Payment.findById(id)
            .populate('property')
            .populate('unit')
            .populate('client')
            .populate('contract')
            .populate('processedBy')
            .populate('depositHistory.processedBy');
        if (!payment) {
            return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: payment });
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

        // Clean up optional ObjectId fields if they are empty strings
        if (cleanedBody.unit === "") cleanedBody.unit = null;
        if (cleanedBody.contract === "") cleanedBody.contract = null;
        if (cleanedBody.client === "") delete cleanedBody.client;
        if (cleanedBody.property === "") delete cleanedBody.property;

        // If receivedAmount is being updated, track it in deposit history
        if (cleanedBody.receivedAmount !== undefined) {
            const currentPayment = await Payment.findById(id);
            if (currentPayment) {
                const previousReceived = currentPayment.receivedAmount || 0;
                const newReceived = cleanedBody.receivedAmount;
                const depositAmount = newReceived - previousReceived;

                // Only add to history if there's an actual deposit (positive amount)
                if (depositAmount > 0) {
                    const depositEntry = {
                        amount: depositAmount,
                        date: new Date(),
                        method: cleanedBody.paymentMethod || currentPayment.paymentMethod || 'Cash',
                        processedBy: cleanedBody.processedBy,
                        notes: cleanedBody.depositNotes || `Deposit of $${depositAmount.toLocaleString()}`
                    };

                    // Add to deposit history
                    if (!cleanedBody.depositHistory) {
                        cleanedBody.depositHistory = currentPayment.depositHistory || [];
                    }
                    cleanedBody.depositHistory.push(depositEntry);
                }
            }
        }

        const payment = await Payment.findByIdAndUpdate(id, cleanedBody, { new: true });
        if (!payment) {
            return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: payment });
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
        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Payment deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
