# Hospital Management System

A comprehensive hospital management system with patient, doctor, and admin portals.

## Features

- Patient Portal: Schedule appointments, view medical records
- Doctor Portal: Manage patients, schedule, and appointments
- Admin Portal: Hospital administration and management
- Blood Bank Management
- User Authentication and Authorization

## Demo Mode

This application includes a demo mode that works without a database connection.

**Demo Credentials:**

- Email: `demo@hospital.com`
- Password: `demo1234`

When the application can't connect to a database, it will automatically fall back to demo mode, allowing basic functionality to be demonstrated without requiring a full database setup.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL

## Deployment on Render

### Prerequisites

1. A Render account: [https://render.com/](https://render.com/)
2. A MySQL database service (Render doesn't provide MySQL):
   - PlanetScale (free tier): [https://planetscale.com/](https://planetscale.com/)
   - Railway (free trial): [https://railway.app/](https://railway.app/)
   - AWS RDS (free tier): [https://aws.amazon.com/rds/](https://aws.amazon.com/rds/)

### Deployment Steps

1. **Set up MySQL Database**

   - Create a MySQL database on your chosen cloud provider
   - Note the database credentials (host, username, password, and database name)

2. **Deploy to Render**

   - Create a new Web Service in Render
   - Connect to your GitHub repository
   - Configure the following settings:
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set Environment Variables in Render**

   - Add the following environment variables:
     - `DB_HOST`: Your MySQL database host
     - `DB_USER`: Database username
     - `DB_PASSWORD`: Database password
     - `DB_NAME`: Database name (typically "HOSPITAL_DB")
     - `NODE_ENV`: Set to "production"

4. **Deploy the Service**

   - Click "Create Web Service" to deploy
   - Wait for the deployment to complete
   - Your application will be available at the provided URL

5. **Using Without a Database**
   - If you don't want to set up a database, the application will run in demo mode
   - Use the demo credentials above to log in

## Local Development

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/Hospital_Management_System.git
   cd Hospital_Management_System
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up a local MySQL database (schema will be created automatically)

4. Start the development server:

   ```
   npm run dev
   ```

5. Access the application at http://localhost:3000

## License

ISC
