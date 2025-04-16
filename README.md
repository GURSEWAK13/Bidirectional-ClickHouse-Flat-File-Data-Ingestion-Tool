# Bidirectional ClickHouse & Flat File Data Ingestion Tool

A web-based application that facilitates data ingestion between a ClickHouse database and CSV files. The application supports bidirectional data flow (ClickHouse to CSV and CSV to ClickHouse), handles JWT token-based authentication for ClickHouse as a source, allows users to select specific columns for ingestion, and reports the total number of records processed upon completion.

## Features

- **Bidirectional Flow**: Import from/export to both ClickHouse and CSV files
- **Source Selection**: Choose between ClickHouse or CSV as a data source
- **ClickHouse Connection**: Connect using host, port, database, user, and JWT token
- **CSV Upload & Configuration**: Upload CSV files and configure delimiters
- **Schema Discovery**: Fetch available tables and columns
- **Column Selection**: Choose which columns to include in the ingestion
- **Multi-Table Join**: Join multiple ClickHouse tables with custom join conditions
- **Data Preview**: Preview data before ingestion
- **Progress Tracking**: Visual indicators of ingestion progress
- **Results Reporting**: Summary of ingestion results including record count

## Architecture

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **ClickHouse Client**: Official Node.js client
- **CSV Processing**: Node.js CSV parser/writer libraries

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- ClickHouse database instance (local or cloud-based)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd flat-ingestor
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Configuration

1. Create a `.env` file in the backend directory:
   ```
   PORT=5001
   CLICKHOUSE_HOST=
   CLICKHOUSE_PORT=
   CLICKHOUSE_PROTOCOL=
   CLICKHOUSE_USER=
   CLICKHOUSE_PASSWORD=
   CLICKHOUSE_DEFAULT_DATABASE=
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage Guide

### ClickHouse to CSV Flow

1. Select "ClickHouse" as the source
2. Enter ClickHouse connection details and connect
3. Select table(s) and configure join conditions (if applicable)
4. Select columns to include in the export
5. Click "Preview Data" to review (optional)
6. Click "Start Ingestion" to export to CSV
7. Download the resulting CSV file

### CSV to ClickHouse Flow

1. Select "Flat File (CSV)" as the source
2. Upload a CSV file and configure delimiter
3. Select columns to include in the import
4. Configure ClickHouse connection details and target table
5. Click "Preview Data" to review (optional)
6. Click "Start Ingestion" to import to ClickHouse
7. View the ingestion results

## Development Notes

- The backend runs on port 5001 by default
- The frontend runs on port 5173 with Vite
- Files are uploaded to the `uploads` directory in the backend
- CSV exports are also stored in the `uploads` directory # Bidirectional-ClickHouse-Flat-File-Data-Ingestion-Tool
