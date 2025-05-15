const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    wasteEntries: [{
        date: {
            type: Date,
            required: true
        },
        wasteAmount: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            required: true
        },
        notes: String,
        factors: [String]
    }],
    goals: [{
        targetAmount: {
            type: Number,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Failed'],
            default: 'Active'
        },
        progress: {
            type: Number,
            default: 0
        }
    }],
    preferences: {
        measurementUnit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to add waste entry
userSchema.methods.addWasteEntry = async function(entry) {
    this.wasteEntries.push(entry);
    return this.save();
};

// Method to add goal
userSchema.methods.addGoal = async function(goal) {
    this.goals.push(goal);
    return this.save();
};

// Method to get waste statistics
userSchema.methods.getWasteStats = function() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const monthlyEntries = this.wasteEntries.filter(entry => 
        entry.date >= lastMonth && entry.date <= now
    );
    
    const totalWaste = monthlyEntries.reduce((sum, entry) => sum + entry.wasteAmount, 0);
    const averageWaste = totalWaste / (monthlyEntries.length || 1);
    
    const categoryCounts = monthlyEntries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
    }, {});
    
    return {
        totalWaste,
        averageWaste,
        categoryCounts,
        entryCount: monthlyEntries.length
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User; 