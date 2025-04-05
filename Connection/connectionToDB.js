import mysql from "mysql2";

let db;

try {
    const initialConnection = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
    });
    initialConnection.query('CREATE DATABASE IF NOT EXISTS HOSPITAL_DB');
    
    db = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'HOSPITAL_DB'
    });
    
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

}catch(error){
    console.log(error);
}

export default db ? db.promise() : null;

