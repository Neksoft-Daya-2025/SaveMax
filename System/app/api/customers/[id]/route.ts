import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/initModels';

// GET /api/customers/[id] - Get single customer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const customer = await User.findById(id).select('-password').populate('role');

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: customer });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // Map flat fields to customerDetails if necessary
        const payload: any = { ...body };
        if (body.address || body.notes || body.assignedAgents) {
            payload.customerDetails = {
                ...body.customerDetails,
                address: body.address || body.customerDetails?.address,
                notes: body.notes || body.customerDetails?.notes,
                assignedAgents: body.assignedAgents || body.customerDetails?.assignedAgents
            };
        }

        // Prevent sensitive field updates
        delete payload.password;
        delete payload.email;

        const customer = await User.findByIdAndUpdate(
            id,
            payload,
            { new: true, runValidators: true }
        ).select('-password');

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: customer });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const customer = await User.findByIdAndDelete(id);

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

