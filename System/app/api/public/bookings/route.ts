import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { initModels } from "@/lib/initModels";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        await connectToDB();
        initModels();

        const body = await request.json();
        const { propertyId, unitId, name, email, phone, visitDate, visitTime, message } = body;

        // Validate required fields
        if (!propertyId || !name || !email || !phone || !visitDate || !visitTime) {
            return NextResponse.json(
                { success: false, error: "Please fill in all required fields." },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // Validate propertyId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return NextResponse.json(
                { success: false, error: "Invalid property." },
                { status: 400 }
            );
        }

        // Find existing user by email or create a guest user
        // Always update name and phone to reflect the latest form submission
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({
                name,
                email: email.toLowerCase(),
                phone,
                status: "Active",
            });
        } else {
            // Update user's name and phone with latest form data
            user.name = name;
            user.phone = phone;
            await user.save();
        }

        // Build booking data
        const bookingData: any = {
            property: propertyId,
            customer: user._id,
            visitDate: new Date(visitDate),
            visitTime,
            status: "Pending",
            message: message || "",
        };

        // Add unit if provided and valid
        if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
            bookingData.unit = unitId;
        }

        const booking = await Booking.create(bookingData);

        return NextResponse.json(
            { success: true, data: booking },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Public booking error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
