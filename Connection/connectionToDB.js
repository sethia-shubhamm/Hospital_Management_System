import pkg from 'pg';
const { Pool } = pkg;

let db = null;

try {
    // Check if DATABASE_URL environment variable is provided
    if (process.env.DATABASE_URL) {
        // Connect using connection string
        console.log('Attempting to connect using DATABASE_URL');
        try {
            db = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });
            
            // Test connection
            const initDatabase = async () => {
                try {
                    console.log('Testing database connection...');
                    await db.query('SELECT 1');
                    console.log("✅ Database connection successful");
                    
                    // Create tables if they don't exist
                    await db.query(`
                        CREATE TABLE IF NOT EXISTS LOGIN_DETAILS (
                            EMAIL VARCHAR(255) NOT NULL UNIQUE,
                            PASSWORD VARCHAR(255) NOT NULL,
                            USER_TYPE VARCHAR(10) DEFAULT 'patient' CHECK (USER_TYPE IN ('patient', 'doctor', 'admin'))
                        )
                    `);
                    
                    await db.query(`
                        CREATE TABLE IF NOT EXISTS PATIENT_DETAILS (
                            PATIENT_ID SERIAL PRIMARY KEY,
                            NAME VARCHAR(255) NOT NULL,
                            AGE INT NOT NULL,
                            GENDER VARCHAR(6) NOT NULL CHECK (GENDER IN ('male', 'female')),
                            CONTACT VARCHAR(255) NOT NULL,
                            BLOOD_TYPE VARCHAR(2) NOT NULL
                        )
                    `);
                    
                    // Set the starting ID to 1001 (PostgreSQL way)
                    await db.query(`
                        DO $$
                        BEGIN
                            IF EXISTS (
                                SELECT 1 FROM information_schema.sequences 
                                WHERE sequence_name = 'patient_details_patient_id_seq'
                            ) THEN
                                ALTER SEQUENCE patient_details_patient_id_seq RESTART WITH 1001;
                            END IF;
                        END $$;
                    `);
                    
                } catch (err) {
                    console.error("❌ Database initialization error:", err.message);
                    db = null;
                }
            };
            
            initDatabase();
            
        } catch (err) {
            console.error("❌ Database setup error:", err.message);
            db = null;
        }
    } else {
        // Use individual environment variables with fallback to local development settings
        const DB_HOST = process.env.DB_HOST || 'localhost';
        const DB_USER = process.env.DB_USER || 'postgres';
        const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
        const DB_NAME = process.env.DB_NAME || 'HOSPITAL_DB';
        const DB_PORT = process.env.DB_PORT || 5432;
        
        console.log(`Attempting to connect to database at ${DB_HOST}`);
        
        // Make sure we have a valid DB_HOST - don't try to connect if it's clearly invalid
        if (DB_HOST && !DB_HOST.includes(' ') && DB_HOST !== 'HP_MANAGEMENT') {
            // Create the connection pool
            try {
                db = new Pool({
                    host: DB_HOST,
                    user: DB_USER,
                    password: DB_PASSWORD,
                    database: DB_NAME,
                    port: DB_PORT,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
                });
                
                // Test connection and create tables if they don't exist
                const initDatabase = async () => {
                    try {
                        // Test connection
                        console.log('Testing database connection...');
                        await db.query('SELECT 1');
                        console.log("✅ Database connection successful");
                        
                        // Create tables if they don't exist
                        await db.query(`
                            CREATE TABLE IF NOT EXISTS LOGIN_DETAILS (
                                EMAIL VARCHAR(255) NOT NULL UNIQUE,
                                PASSWORD VARCHAR(255) NOT NULL,
                                USER_TYPE VARCHAR(10) DEFAULT 'patient' CHECK (USER_TYPE IN ('patient', 'doctor', 'admin'))
                            )
                        `);
                        
                        await db.query(`
                            CREATE TABLE IF NOT EXISTS PATIENT_DETAILS (
                                PATIENT_ID SERIAL PRIMARY KEY,
                                NAME VARCHAR(255) NOT NULL,
                                AGE INT NOT NULL,
                                GENDER VARCHAR(6) NOT NULL CHECK (GENDER IN ('male', 'female')),
                                CONTACT VARCHAR(255) NOT NULL,
                                BLOOD_TYPE VARCHAR(2) NOT NULL
                            )
                        `);
                        
                        // Set the starting ID to 1001 (PostgreSQL way)
                        await db.query(`
                            DO $$
                            BEGIN
                                IF EXISTS (
                                    SELECT 1 FROM information_schema.sequences 
                                    WHERE sequence_name = 'patient_details_patient_id_seq'
                                ) THEN
                                    ALTER SEQUENCE patient_details_patient_id_seq RESTART WITH 1001;
                                END IF;
                            END $$;
                        `);
                        
                    } catch (err) {
                        console.error("❌ Database initialization error:", err.message);
                        db = null;
                    }
                };
                
                initDatabase();
                
            } catch (err) {
                console.error("❌ Database setup error:", err.message);
                db = null;
            }
        } else {
            console.log("⚠️ Invalid database host configuration. Running in static mode (no database functionality).");
            db = null;
        }
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

