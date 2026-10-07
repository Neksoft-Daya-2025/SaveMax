import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    console.log('=== REGISTRATION ENDPOINT CALLED ===');

    try {
        const body = await req.json();
        console.log('Request body:', { ...body, password: '[REDACTED]' });

        const { name, email, password, role: roleName } = body;

        // Validate input
        if (!email || !password) {
            console.log('❌ Validation failed: Missing email or password');
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            console.log('❌ Validation failed: Password too short');
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Connect to database
        console.log('📡 Connecting to database...');
        const { Role } = await import('@/lib/initModels'); // Ensure Role model is imported
        await dbConnect();
        console.log('✅ Database connected');

        // Check if user already exists
        console.log('🔍 Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('⚠️ User already exists');
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            );
        }
        console.log('✅ No existing user found');

        // Find the role - Only allow Customer for registration
        const targetRoleName = 'Customer';
        const roleDoc = await Role.findOne({ name: targetRoleName });
        if (!roleDoc) {
            console.log('❌ Role not found:', targetRoleName);
            return NextResponse.json(
                { error: `Role '${targetRoleName}' not found. Please contact administrator.` },
                { status: 400 }
            );
        }

        // Create new user (password will be hashed by the pre-save hook)
        console.log('👤 Creating new user with role:', targetRoleName);
        const user = await User.create({
            name,
            email,
            password,
            role: roleDoc._id
        });
        console.log('✅ User created successfully:', user._id);


        // Return success (don't send password back)
        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            console.log('Validation error details:', error.errors);
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        // Handle MongoDB connection errors
        if (error.name === 'MongooseError' || error.message?.includes('connect')) {
            return NextResponse.json(
                { error: 'Database connection failed. Please check your MongoDB connection string.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
