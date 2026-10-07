
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Amenity, initModels } from "@/lib/initModels";
import { checkPermission } from "@/lib/rbac";
import { auth } from "@/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();

        const permissionError = await checkPermission(request, 'amenities', 'view');
        if (permissionError) return permissionError;

        const amenity = await Amenity.findById(id);
        if (!amenity) {
            return NextResponse.json({ success: false, error: "Amenity not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: amenity });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();

        const permissionError = await checkPermission(request, 'amenities', 'edit');
        if (permissionError) return permissionError;

        const body = await request.json();
        const amenity = await Amenity.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!amenity) {
            return NextResponse.json({ success: false, error: "Amenity not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: amenity });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();

        const permissionError = await checkPermission(request, 'amenities', 'delete');
        if (permissionError) return permissionError;

        const amenity = await Amenity.findByIdAndDelete(id);
        if (!amenity) {
            return NextResponse.json({ success: false, error: "Amenity not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Amenity deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
