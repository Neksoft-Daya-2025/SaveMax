
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
        const agent = await User.findById(id).select("-password").populate("role");
        if (!agent) {
            return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: agent });
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

        // Remove sensitive fields that shouldn't be updated here
        delete body.password;
        delete body.email;

        // If role comes through as an empty string (""), null or other falsy value,
        // drop it instead of trying to cast it to ObjectId (which causes BSONError).
        if (!body.role) {
            delete body.role;
        }

        const agent = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
        if (!agent) {
            return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: agent });
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
        const agent = await User.findByIdAndDelete(id);
        if (!agent) {
            return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Agent deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
