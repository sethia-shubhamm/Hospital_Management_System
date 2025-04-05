import express from "express";
import db from "./Connection/connectionToDB.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));

// Middleware to check for database and handle errors
const dbMiddleware = async (req, res, next) => {
    if (!db) {
        // Check if this is a demo login request
        if (req.body && req.body.email === 'demo@hospital.com' && req.body.password === 'demo1234') {
            // Allow demo login to pass through
            req.isDemoUser = true;
            return next();
        }
        
        return res.status(503).json({ 
            status: 'error', 
            message: 'Database service unavailable. Please try the demo account instead.' 
        });
    }
    
    try {
        // Test the connection before proceeding
        await db.query('SELECT 1');
        next();
    } catch (error) {
        console.error('Database query error in middleware:', error);
        
        // Check if this is a demo login request
        if (req.body && req.body.email === 'demo@hospital.com' && req.body.password === 'demo1234') {
            // Allow demo login to pass through
            req.isDemoUser = true;
            return next();
        }
        
        return res.status(503).json({ 
            status: 'error', 
            message: 'Database service unavailable. Please try the demo account instead.' 
        });
    }
};

// Static routes that don't require database
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'mainDashboard.html'));
});

// Routes for login pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'login', 'index.html'));
});

app.get('/doctorLogin', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'doctorLogin', 'index.html'));
});

app.get('/adminLogin', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'adminLogin', 'index.html'));
});

app.get('/signUp', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'signUp', 'index.html'));
});

// Database health check endpoint
app.get('/api/health', async (req, res) => {
    if (!db) {
        return res.status(503).json({ 
            status: 'error', 
            message: 'Database not connected. The application is running in static demo mode.' 
        });
    }
    
    try {
        await db.query('SELECT 1');
        return res.status(200).json({ status: 'ok', message: 'Database connected' });
    } catch (error) {
        console.error('Health check error:', error);
        return res.status(503).json({ 
            status: 'error', 
            message: 'Database connection error. The application is running in static demo mode.' 
        });
    }
});

// Mock data for demo mode
const DEMO_USER = {
    EMAIL: 'demo@hospital.com',
    USER_TYPE: 'patient'
};

const DEMO_PATIENT = {
    PATIENT_ID: 1001,
    NAME: 'Demo Patient',
    AGE: 30,
    GENDER: 'male',
    CONTACT: '+1 (555) 123-4567',
    BLOOD_TYPE: 'O+'
};

// API routes that require database - use dbMiddleware
app.post('/api/login', dbMiddleware, async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Handle demo user
        if (email === 'demo@hospital.com' && password === 'demo1234') {
            return res.status(200).json({ 
                message: 'Demo login successful',
                user: DEMO_USER
            });
        }
        
        // Only proceed with database query if we have a connection
        if (db) {
            const result = await db.query(
                'SELECT * FROM LOGIN_DETAILS WHERE EMAIL = $1 AND PASSWORD = $2 AND USER_TYPE = $3',
                [email, password, userType || 'patient']
            );
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                
                delete user.password;
                
                return res.status(200).json({ 
                    message: 'Login successful',
                    user: user
                });
            } else {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid credentials. Try the demo account.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/signUp', dbMiddleware, async (req, res) => {
    try {
        const { name, email, password, age, gender, contact, address, bloodGroup, confirmPassword } = req.body;
        
        // Basic validation
        if (!name || !email || !password || !age || !gender || !contact || !bloodGroup) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        
        // If in demo mode, return a mock success response
        if (!db) {
            return res.status(200).json({
                message: 'Demo registration successful! In production, this would create a real account.',
                note: 'This is running in demo mode without a database connection.',
                patientId: 9999
            });
        }
        
        // Check if email already exists
        const existingUser = await db.query('SELECT * FROM LOGIN_DETAILS WHERE EMAIL = $1', [email]);
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        
        // Start transaction
        const client = await db.connect();
        
        try {
            // Begin transaction
            await client.query('BEGIN');
            
            // Insert into LOGIN_DETAILS
            await client.query(
                'INSERT INTO LOGIN_DETAILS (EMAIL, PASSWORD, USER_TYPE) VALUES ($1, $2, $3)',
                [email, password, 'patient']
            );
            
            // Insert into PATIENT_DETAILS
            const result = await client.query(
                'INSERT INTO PATIENT_DETAILS (NAME, AGE, GENDER, CONTACT, BLOOD_TYPE) VALUES ($1, $2, $3, $4, $5) RETURNING PATIENT_ID',
                [name, age, gender, contact, bloodGroup]
            );
            
            // Commit transaction
            await client.query('COMMIT');
            
            return res.status(201).json({ 
                message: 'Registration successful',
                patientId: result.rows[0].patient_id
            });
        } catch (error) {
            // Rollback on error
            await client.query('ROLLBACK');
            throw error; // Re-throw to be caught by outer try-catch
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});














