import mysql from "mysql2";

let db = null;

try {
    // Use environment variables with fallback to local development settings
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_NAME = process.env.DB_NAME || 'HOSPITAL_DB';
    
    console.log(`Attempting to connect to database at ${DB_HOST}`);
    
    // Make sure we have a valid DB_HOST - don't try to connect if it's clearly invalid
    if (DB_HOST && !DB_HOST.includes(' ') && DB_HOST !== 'HP_MANAGEMENT') {
        // Create the connection pool
        try {
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
            console.log('Testing database connection...');
            db.query('SELECT 1')
                .then(() => {
                    console.log("✅ Database connection successful");
                    
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
                    console.error("❌ Failed to connect to database:", err.message);
                    db = null;
                });
        } catch (err) {
            console.error("❌ Database setup error:", err.message);
            db = null;
        }
    } else {
        console.log("⚠️ Invalid database host configuration. Running in static mode (no database functionality).");
        db = null;
    }
} catch(error) {
    console.error("❌ Database setup error:", error.message);
    db = null;
}

// Use setTimeout to give time for the initial connection to be established
// before exporting the module
setTimeout(() => {
    if (db) {
        console.log("📊 Database module ready with connection");
    } else {
        console.log("🚫 Database module ready without connection (static mode)");
    }
}, 1000);

export default db;

