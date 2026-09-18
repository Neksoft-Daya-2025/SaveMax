/* Developed by RUDRA via NEKLLM */
import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    totalPurchases: number;
    createdBy?: string;
    organization?: mongoose.Types.ObjectId;
    status: 'active' | 'inactive';
}

const customerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        notes: { type: String, trim: true },
        totalPurchases: { type: Number, default: 0, min: 0 },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Index for faster searches
customerSchema.index({ name: 'text', email: 'text', phone: 'text' });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

