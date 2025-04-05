import mysql from "mysql2";

let db;

try {
    // Use environment variables with fallback to local development settings
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
    const DB_NAME = process.env.DB_NAME || 'HOSPITAL_DB';
    
    // For development: create database if it doesn't exist
    if (!process.env.DB_HOST) {
        const initialConnection = mysql.createPool({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
        });
        initialConnection.query('CREATE DATABASE IF NOT EXISTS HOSPITAL_DB');
    }
    
    // Create the connection pool
    db = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    });
    
    // Create tables if they don't exist
    db.query(`
        CREATE TABLE IF NOT EXISTS LOGIN_DETAILS (
            EMAIL VARCHAR(255) NOT NULL UNIQUE,
            PASSWORD VARCHAR(255) NOT NULL,
            USER_TYPE ENUM('patient', 'doctor', 'admin') DEFAULT 'patient'
        )
    `);

    db.query(`
        CREATE TABLE IF NOT EXISTS PATIENT_DETAILS (
            PATIENT_ID INT AUTO_INCREMENT PRIMARY KEY,
            NAME VARCHAR(255) NOT NULL,
            AGE INT NOT NULL,
            GENDER ENUM('male', 'female') NOT NULL,
            CONTACT VARCHAR(255) NOT NULL,
            BLOOD_TYPE VARCHAR(2) NOT NULL
        )
    `);
    
    db.query(`
        ALTER TABLE PATIENT_DETAILS AUTO_INCREMENT = 1001
    `);

    console.log("Database connection successful");

} catch(error) {
    console.error("Database connection error:", error);
}

export default db ? db.promise() : null;

