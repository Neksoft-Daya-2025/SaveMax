/* Developed by RUDRA via NEKLLM */

import mongoose, { Schema, Model, models } from 'mongoose';

export interface IContract {
    _id: string;
    property: mongoose.Types.ObjectId;
    unit?: mongoose.Types.ObjectId;
    type: 'Sale' | 'Rent' | 'Lease';
    parties: {
        owner: mongoose.Types.ObjectId;
        client: mongoose.Types.ObjectId; // Buyer or Tenant
        agent?: mongoose.Types.ObjectId;
    };
    details: {
        startDate: Date;
        endDate?: Date;
        amount: number;
        billingCycle?: 'Monthly' | 'Quarterly' | 'Yearly';
        securityDeposit?: number;
        lateFee?: number;
    };
    status: 'Draft' | 'Active' | 'Expired' | 'Terminated' | 'Completed';
    documents: {
        name: string;
        url: string;
    }[];
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
    {
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        type: { type: String, enum: ['Sale', 'Rent', 'Lease'], required: true },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        parties: {
            owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            agent: { type: Schema.Types.ObjectId, ref: 'User' }
        },
        details: {
            startDate: { type: Date, required: true },
            endDate: { type: Date },
            amount: { type: Number, required: true },
            billingCycle: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'] },
            securityDeposit: { type: Number },
            lateFee: { type: Number }
        },
        status: {
            type: String,
            enum: ['Draft', 'Active', 'Expired', 'Terminated', 'Completed'],
            default: 'Draft'
        },
        documents: [{
            name: String,
            url: String
        }]
    },
    {
        timestamps: true,
    }
);

const Contract = (models.Contract as Model<IContract>) || mongoose.model<IContract>('Contract', ContractSchema);

export default Contract;
