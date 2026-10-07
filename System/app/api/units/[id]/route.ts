
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Unit } from '@/lib/initModels';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const unit = await Unit.findById(id)
            .populate('property', 'title location images description')
            .populate('owner', 'name email phone')
            .populate('tenant', 'name email phone')
            .populate('createdBy', 'name');

        if (!unit) {
            return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: unit });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();
        const body = await request.json();

        // Prevent updating property/relationships directly if not needed, but generally allow full update
        const unit = await Unit.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!unit) {
            return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: unit });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const unit = await Unit.findByIdAndDelete(id);

        if (!unit) {
            return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Unit deleted" });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
