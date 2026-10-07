
import mongoose, { Schema, Model, models } from 'mongoose';

export interface IUnit {
    _id: string;
    property: mongoose.Types.ObjectId; // Parent Property (Project/Building)
    unitNumber: string;
    block?: string;
    floor?: string;
    type?: string; // e.g. "2BHK", "Studio"
    price: number;
    areaSize: number;
    bedrooms?: number;
    bathrooms?: number;
    windows?: number;
    status: 'Available' | 'Sold' | 'Rented' | 'Booked' | 'Reserved';
    features?: string[];
    images?: { url: string; isFeatured: boolean }[]; // Unit specific images
    isCorner?: boolean;
    facing?: string;
    owner?: mongoose.Types.ObjectId;
    tenant?: mongoose.Types.ObjectId;
    organization?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
    {
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unitNumber: { type: String, required: true, trim: true },
        block: { type: String, trim: true },
        floor: { type: String, trim: true },
        type: { type: String, trim: true },
        price: { type: Number, required: true },
        areaSize: { type: Number, required: true },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        windows: { type: Number },
        status: {
            type: String,
            enum: ['Available', 'Sold', 'Rented', 'Booked', 'Reserved'],
            default: 'Available'
        },
        features: [String],
        images: [{
            url: { type: String, required: true },
            isFeatured: { type: Boolean, default: false }
        }],
        isCorner: { type: Boolean, default: false },
        facing: { type: String },
        owner: { type: Schema.Types.ObjectId, ref: 'User' },
        tenant: { type: Schema.Types.ObjectId, ref: 'User' },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true
    }
);

// Compound index to ensure unique unit number per block/property
UnitSchema.index({ property: 1, block: 1, unitNumber: 1 }, { unique: true });

const Unit = (models.Unit as Model<IUnit>) || mongoose.model<IUnit>('Unit', UnitSchema);

export default Unit;
