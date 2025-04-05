import mysql from "mysql2";

let db = null;

try {
    // Use environment variables with fallback to local development settings
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_NAME = process.env.DB_NAME || 'HOSPITAL_DB';
    
    console.log(`Attempting to connect to database at ${DB_HOST}`);
    
    // Skip database creation in production environment
    if (process.env.NODE_ENV !== 'production' && !process.env.DB_HOST) {
        try {
            const initialConnection = mysql.createPool({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
            });
            initialConnection.query('CREATE DATABASE IF NOT EXISTS HOSPITAL_DB');
        } catch (err) {
            console.error("Database initialization error:", err);
        }
    }
    
    // Create the connection pool
    db = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000, // 10 seconds
    }).promise();
    
    // Test connection
    db.query('SELECT 1')
        .then(() => {
            console.log("Database connection successful");
            
            // Create tables if they don't exist
            return Promise.all([
                db.query(`
                    CREATE TABLE IF NOT EXISTS LOGIN_DETAILS (
                        EMAIL VARCHAR(255) NOT NULL UNIQUE,
                        PASSWORD VARCHAR(255) NOT NULL,
                        USER_TYPE ENUM('patient', 'doctor', 'admin') DEFAULT 'patient'
                    )
                `),
                db.query(`
                    CREATE TABLE IF NOT EXISTS PATIENT_DETAILS (
                        PATIENT_ID INT AUTO_INCREMENT PRIMARY KEY,
                        NAME VARCHAR(255) NOT NULL,
                        AGE INT NOT NULL,
                        GENDER ENUM('male', 'female') NOT NULL,
                        CONTACT VARCHAR(255) NOT NULL,
                        BLOOD_TYPE VARCHAR(2) NOT NULL
                    )
                `),
                db.query(`
                    ALTER TABLE PATIENT_DETAILS AUTO_INCREMENT = 1001
                `)
            ]);
        })
        .catch(err => {
            console.error("Failed to connect to database:", err);
            db = null;
        });

} catch(error) {
    console.error("Database setup error:", error);
    db = null;
}

export default db;

