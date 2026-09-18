/* Developed by RUDRA via NEKLLM */

import mongoose, { Schema, Model, models } from 'mongoose';

export interface IMaintenance {
    _id: string;
    title: string;
    description: string;
    property: mongoose.Types.ObjectId;
    unit?: mongoose.Types.ObjectId;
    priority: 'Low' | 'Medium' | 'High' | 'Emergency';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    type: 'Routine' | 'Repair' | 'Emergency' | 'Inspection';
    requestedBy?: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    cost?: number;
    images: string[];
    scheduledDate?: Date;
    completedDate?: Date;
    notes?: string;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Emergency'],
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        type: {
            type: String,
            enum: ['Routine', 'Repair', 'Emergency', 'Inspection'],
            default: 'Repair'
        },
        requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        cost: { type: Number },
        images: [{ type: String }],
        scheduledDate: { type: Date },
        completedDate: { type: Date },
        notes: { type: String }
    },
    {
        timestamps: true,
    }
);

const Maintenance = (models.Maintenance as Model<IMaintenance>) || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);

export default Maintenance;
