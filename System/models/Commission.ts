
import mongoose, { Schema, Model, models } from 'mongoose';

export interface ICommission {
    _id: string;
    agent: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    contract: mongoose.Types.ObjectId;
    payment?: mongoose.Types.ObjectId;
    amount: number;
    rate: number; // Percentage or fixed
    type: 'Sale' | 'Rent' | 'Lease';
    status: 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
    paidDate?: Date;
    notes?: string;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        contract: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
        payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
        amount: { type: Number, required: true },
        rate: { type: Number, required: true },
        type: { type: String, enum: ['Sale', 'Rent', 'Lease'], required: true },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Paid', 'Cancelled'],
            default: 'Pending'
        },
        paidDate: { type: Date },
        notes: { type: String }
    },
    {
        timestamps: true,
    }
);

const Commission = (models.Commission as Model<ICommission>) || mongoose.model<ICommission>('Commission', CommissionSchema);

export default Commission;
