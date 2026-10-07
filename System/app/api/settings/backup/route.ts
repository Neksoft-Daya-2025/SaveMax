import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/rbac";

// GET /api/settings/backup - Download a JSON backup of the database
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only users with settings edit permission can download backups
        const permissionError = await checkPermission(request, "settings", "edit");
        if (permissionError) return permissionError;

        const conn = await connectDB();
        const db = conn.connection.db;

        if (!db) {
            return NextResponse.json(
                { success: false, error: "Database connection not available" },
                { status: 500 }
            );
        }

        const collections = await db.listCollections().toArray();

        const backup: Record<string, any[]> = {};

        for (const col of collections) {
            const collection = db.collection(col.name);
            const docs = await collection.find({}).toArray();
            // Convert BSON types (ObjectId, Date, etc.) to plain JSON-friendly values
            backup[col.name] = JSON.parse(JSON.stringify(docs));
        }

        const json = JSON.stringify(backup, null, 2);
        const timestamp = new Date().toISOString().replace(/[:]/g, "-");
        const filename = `db-backup-${timestamp}.json`;

        return new NextResponse(json, {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error: any) {
        console.error("Error generating database backup:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to generate backup" },
            { status: 500 }
        );
    }
}

