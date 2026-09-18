/* Developed by RUDRA via NEKLLM */

import mongoose, { Schema, Model, models } from 'mongoose';

export interface IBooking {
    _id: string;
    property: mongoose.Types.ObjectId;
    unit?: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    agent?: mongoose.Types.ObjectId;
    visitDate: Date;
    visitTime: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';
    message?: string;
    adminNotes?: string;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        agent: { type: Schema.Types.ObjectId, ref: 'User' },
        visitDate: { type: Date, required: true },
        visitTime: { type: String, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show'],
            default: 'Pending'
        },
        message: String,
        adminNotes: String
    },
    {
        timestamps: true,
    }
);

const Booking = (models.Booking as Model<IBooking>) || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
