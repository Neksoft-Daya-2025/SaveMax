
import mongoose, { Schema, Model, models } from 'mongoose';

export interface IAmenity {
    _id: string;
    name: string;
    icon?: string; // Icon name from lucide-react or URL
    status: 'Active' | 'Inactive';
    organization?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AmenitySchema = new Schema<IAmenity>(
    {
        name: { type: String, required: true, trim: true },
        icon: { type: String, trim: true },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },
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

const Amenity = (models.Amenity as Model<IAmenity>) || mongoose.model<IAmenity>('Amenity', AmenitySchema);

export default Amenity;
