import express from "express";
import db from "./Connection/connectionToDB.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));

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
        return res.status(503).json({ status: 'error', message: 'Database not connected' });
    }
    
    try {
        await db.query('SELECT 1');
        return res.status(200).json({ status: 'ok', message: 'Database connected' });
    } catch (error) {
        console.error('Health check error:', error);
        return res.status(503).json({ status: 'error', message: 'Database connection error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
    
        const [rows] = await db.query(
            'SELECT * FROM LOGIN_DETAILS WHERE EMAIL = ? AND PASSWORD = ? AND USER_TYPE = ?',
            [email, password, userType || 'patient']
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            
            delete user.PASSWORD;
            
            return res.status(200).json({ 
                message: 'Login successful',
                user: user
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/signUp', async (req, res) => {
    try {
        const { name, email, password, age, gender, contact, address, bloodGroup, confirmPassword } = req.body;
        
        // Basic validation
        if (!name || !email || !password || !age || !gender || !contact || !bloodGroup) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        
        // Check if email already exists
        const [existingUser] = await db.query('SELECT * FROM LOGIN_DETAILS WHERE EMAIL = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        
        // Start transaction to ensure both tables are updated
        await db.query('START TRANSACTION');
        
        // Insert into LOGIN_DETAILS
        await db.query(
            'INSERT INTO LOGIN_DETAILS (EMAIL, PASSWORD, USER_TYPE) VALUES (?, ?, ?)',
            [email, password, 'patient']
        );
        
        // Insert into PATIENT_DETAILS
        const [result] = await db.query(
            'INSERT INTO PATIENT_DETAILS (NAME, AGE, GENDER, CONTACT, BLOOD_TYPE) VALUES (?, ?, ?, ?, ?)',
            [name, age, gender, contact, bloodGroup]
        );
        
        // Commit transaction
        await db.query('COMMIT');
        
        return res.status(201).json({ 
            message: 'Registration successful',
            patientId: result.insertId
        });
    } catch (error) {
        // Rollback on error
        await db.query('ROLLBACK');
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});














