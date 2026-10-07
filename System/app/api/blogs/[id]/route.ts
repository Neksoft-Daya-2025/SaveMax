
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { auth } from "@/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDB();
        const blog = await BlogPost.findById(id).populate('author', 'name email profileImage');

        if (!blog) {
            return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: blog });
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
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        const body = await request.json();
        const blog = await BlogPost.findByIdAndUpdate(id, body, { new: true });

        if (!blog) {
            return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: blog });
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
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        const blog = await BlogPost.findByIdAndDelete(id);

        if (!blog) {
            return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Blog post deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
