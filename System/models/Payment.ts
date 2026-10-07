
import mongoose, { Schema, Model, models } from 'mongoose';

export interface IPayment {
    _id: string;
    property: mongoose.Types.ObjectId;
    unit?: mongoose.Types.ObjectId;
    contract?: mongoose.Types.ObjectId;
    client: mongoose.Types.ObjectId;
    amount: number;
    receivedAmount: number;
    totalAmount: number;
    paymentType: 'Rent' | 'Sale Installment' | 'Security Deposit' | 'Recurring' | 'Other';
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Online' | 'Cheque';
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    transactionId?: string;
    billingMonth?: string;
    billingYear?: number;
    invoiceNumber: string;
    processedBy?: mongoose.Types.ObjectId;
    notes?: string;
    depositHistory?: Array<{
        amount: number;
        date: Date;
        method: string;
        processedBy?: mongoose.Types.ObjectId;
        notes?: string;
    }>;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        contract: { type: Schema.Types.ObjectId, ref: 'Contract' },
        client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        amount: { type: Number, required: true },
        receivedAmount: { type: Number, required: true, default: 0 },
        totalAmount: { type: Number, required: true },
        paymentType: {
            type: String,
            enum: ['Rent', 'Sale Installment', 'Security Deposit', 'Recurring', 'Other'],
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Bank Transfer', 'Card', 'Online', 'Cheque'],
            default: 'Cash'
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
            default: 'Pending'
        },
        transactionId: { type: String, trim: true },
        billingMonth: { type: String },
        billingYear: { type: Number },
        invoiceNumber: { type: String, required: true },
        processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String },
        depositHistory: [{
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            method: { type: String, required: true },
            processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            notes: { type: String }
        }]
    },
    {
        timestamps: true,
    }
);

const Payment = (models.Payment as Model<IPayment>) || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
