import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        select: false
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create demo users on first run
userSchema.statics.createDemoUsers = async function () {
    const adminExists = await this.findOne({ email: 'admin@mitti.com' });
    const userExists = await this.findOne({ email: 'user@mitti.com' });

    if (!adminExists) {
        await this.create({
            name: 'Admin User',
            email: 'admin@mitti.com',
            password: 'admin123',
            role: 'admin',
            verified: true
        });
        console.log('✅ Demo admin user created');
    }

    if (!userExists) {
        await this.create({
            name: 'Demo User',
            email: 'user@mitti.com',
            password: 'user123',
            role: 'user',
            verified: true
        });
        console.log('✅ Demo user created');
    }
};

export default mongoose.model('User', userSchema);
