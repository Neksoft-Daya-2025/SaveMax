
import mongoose, { Schema, Model, models } from 'mongoose';

export interface IDeposit {
    _id: string;
    property: mongoose.Types.ObjectId;
    unit?: mongoose.Types.ObjectId;
    contract?: mongoose.Types.ObjectId;
    client: mongoose.Types.ObjectId;
    amount: number;
    receivedAmount: number;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Online' | 'Cheque';
    status: 'Pending' | 'Received' | 'Refunded' | 'Consumed' | 'Partially Refunded';
    type: 'Security' | 'Holding' | 'Advanced' | 'Other';
    transactionId?: string;
    receiptNumber: string;
    refundedAmount?: number;
    refundDate?: Date;
    processedBy?: mongoose.Types.ObjectId;
    notes?: string;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DepositSchema = new Schema<IDeposit>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        contract: { type: Schema.Types.ObjectId, ref: 'Contract' },
        client: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        amount: { type: Number, required: true },
        receivedAmount: { type: Number, required: true, default: 0 },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Bank Transfer', 'Card', 'Online', 'Cheque'],
            default: 'Cash'
        },
        status: {
            type: String,
            enum: ['Pending', 'Received', 'Refunded', 'Consumed', 'Partially Refunded'],
            default: 'Pending'
        },
        type: {
            type: String,
            enum: ['Security', 'Holding', 'Advanced', 'Other'],
            default: 'Security'
        },
        transactionId: { type: String, trim: true },
        receiptNumber: { type: String, required: true },
        refundedAmount: { type: Number, default: 0 },
        refundDate: { type: Date },
        processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String }
    },
    {
        timestamps: true,
    }
);

const Deposit = (models.Deposit as Model<IDeposit>) || mongoose.model<IDeposit>('Deposit', DepositSchema);

export default Deposit;
