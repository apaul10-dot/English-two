require('dotenv').config();

module.exports = {
    port: process.env.PORT || 2002,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/hunger-stoppers',
    sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Session configuration
    session: {
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
}; 