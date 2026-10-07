
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/lib/initModels";
import { initModels } from "@/lib/initModels";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        initModels();
        const owner = await User.findById(id).select("-password").populate("role");
        if (!owner) {
            return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: owner });
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

        delete body.password;
        delete body.email;

        // If role is an empty string or other falsy value, drop it so Mongoose
        // doesn't try to cast "" to ObjectId (which causes a BSONError).
        if (!body.role) {
            delete body.role;
        }

        const owner = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
        if (!owner) {
            return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: owner });
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
        const owner = await User.findByIdAndDelete(id);
        if (!owner) {
            return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Owner deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
