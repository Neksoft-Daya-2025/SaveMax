/* Developed by RUDRA via NEKLLM */

import mongoose, { Schema, Model, models } from 'mongoose';

export interface IProperty {
    _id: string;
    title: string;
    description: string;
    propertyType: 'Apartment' | 'House' | 'Villa' | 'Land' | 'Commercial' | 'Office' | 'Shop';
    purpose: 'Sale' | 'Rent' | 'Lease';
    status: 'Available' | 'Sold' | 'Rented' | 'Booked' | 'Pending';
    price: number;
    isNegotiable: boolean;
    areaSize: number;
    areaUnit: 'sqft' | 'sqm';
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    floor?: string;
    unit?: string;
    block?: string;
    age?: number;
    possessionDate?: Date;
    location: {
        address: string;
        city: string;
        state?: string;
        country: string;
        zipCode?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    nearbyPlaces: {
        name: string;
        distance: string;
        type: string;
    }[];
    amenities: string[];
    images: {
        url: string;
        isFeatured: boolean;
    }[];
    videos?: {
        platform: 'YouTube' | 'Vimeo' | 'Upload';
        url: string;
    }[];
    documents?: {
        name: string;
        url: string;
        type: string;
    }[];
    floorPlans?: {
        title: string;
        image: string;
    }[];
    virtualTourUrl?: string;
    isFeatured: boolean;
    isHot: boolean;
    agent?: mongoose.Types.ObjectId;
    owner?: mongoose.Types.ObjectId;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    organization?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        propertyType: {
            type: String,
            required: true,
            enum: ['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Office', 'Shop']
        },
        purpose: {
            type: String,
            required: true,
            enum: ['Sale', 'Rent', 'Lease']
        },
        status: {
            type: String,
            required: true,
            enum: ['Available', 'Sold', 'Rented', 'Booked', 'Pending'],
            default: 'Available'
        },
        price: { type: Number, required: true },
        isNegotiable: { type: Boolean, default: false },
        areaSize: { type: Number, required: true },
        areaUnit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        parking: { type: Number },
        floor: { type: String },
        unit: { type: String },
        block: { type: String },
        age: { type: Number },
        possessionDate: { type: Date },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String },
            country: { type: String, required: true },
            zipCode: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number }
            }
        },
        nearbyPlaces: [{
            name: String,
            distance: String,
            type: { type: String }
        }],
        amenities: [String],
        images: [{
            url: { type: String, required: true },
            isFeatured: { type: Boolean, default: false }
        }],
        videos: [{
            platform: { type: String, enum: ['YouTube', 'Vimeo', 'Upload'] },
            url: String
        }],
        documents: [{
            name: String,
            url: String,
            type: { type: String }
        }],
        floorPlans: [{
            title: String,
            image: String
        }],
        virtualTourUrl: { type: String },
        isFeatured: { type: Boolean, default: false },
        isHot: { type: Boolean, default: false },
        agent: { type: Schema.Types.ObjectId, ref: 'User' },
        owner: { type: Schema.Types.ObjectId, ref: 'User' },
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            keywords: [{ type: String }]
        },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true,
    }
);

const Property = (models.Property as Model<IProperty>) || mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
