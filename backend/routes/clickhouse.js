const express = require('express');
const router = express.Router();
const createClickHouseClient = require('../utils/clickhouseClient');
const { writeToCsv } = require('../utils/csvUtils');

// Connect to ClickHouse and test connection
router.post('/connect', async (req, res) => {
  try {
    const { host, port, protocol, database, username, password, jwt } = req.body;
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });

    // Test connection
    const result = await client.query({
      query: 'SELECT 1',
      format: 'JSONEachRow'
    });
    const rows = await result.json();
    
    if (rows.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Successfully connected to ClickHouse' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Connection failed' 
      });
    }
  } catch (error) {
    console.error('ClickHouse connection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Connection failed: ${error.message}` 
    });
  }
});

// Get list of tables from ClickHouse
router.post('/tables', async (req, res) => {
  try {
    const { host, port, protocol, database, username, password, jwt } = req.body;
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });

    const query = `
      SELECT name
      FROM system.tables
      WHERE database = '${database}'
      ORDER BY name
    `;

    const result = await client.query({
      query,
      format: 'JSONEachRow'
    });
    
    const tables = await result.json();
    
    return res.status(200).json({ 
      success: true, 
      tables: tables.map(table => table.name)
    });
  } catch (error) {
    console.error('Error getting tables:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to get tables: ${error.message}` 
    });
  }
});

// Get columns for a specific table
router.post('/columns', async (req, res) => {
  try {
    const { host, port, protocol, database, username, password, jwt, table } = req.body;
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });

    const query = `
      SELECT 
        name,
        type
      FROM system.columns
      WHERE database = '${database}' AND table = '${table}'
      ORDER BY position
    `;

    const result = await client.query({
      query,
      format: 'JSONEachRow'
    });
    
    const columns = await result.json();
    
    return res.status(200).json({ 
      success: true, 
      columns
    });
  } catch (error) {
    console.error('Error getting columns:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to get columns: ${error.message}` 
    });
  }
});

// Execute query to fetch data from ClickHouse
router.post('/query', async (req, res) => {
  try {
    const { host, port, protocol, database, username, password, jwt, query } = req.body;
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });

    const result = await client.query({
      query,
      format: 'JSONEachRow'
    });
    
    const data = await result.json();
    
    return res.status(200).json({ 
      success: true, 
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to execute query: ${error.message}` 
    });
  }
});

// Export data from ClickHouse to CSV
router.post('/to-csv', async (req, res) => {
  try {
    const { 
      host, port, protocol, database, username, password, jwt,
      table, selectedColumns, limit
    } = req.body;
    
    // Build the query
    const columnsString = selectedColumns.join(', ');
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const query = `SELECT ${columnsString} FROM ${database}.${table} ${limitClause}`;
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });
    
    // Execute query
    const result = await client.query({
      query,
      format: 'JSONEachRow'
    });
    
    const data = await result.json();
    
    // Write data to CSV
    const outputPath = await writeToCsv(data, selectedColumns);
    
    // Return the CSV file path and record count
    return res.status(200).json({ 
      success: true, 
      filePath: outputPath.replace(/\\/g, '/'),
      count: data.length,
      message: `Successfully exported ${data.length} records to CSV`
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to export data: ${error.message}` 
    });
  }
});

// Export data from joined ClickHouse tables to CSV
router.post('/join-to-csv', async (req, res) => {
  try {
    const { 
      host, port, protocol, database, username, password, jwt,
      tables, joinConditions, selectedColumns, limit
    } = req.body;
    
    // Validate we have tables to join
    if (!tables || tables.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No tables provided for join operation` 
      });
    }

    // If only one table, redirect to the regular export
    if (tables.length === 1) {
      const modifiedBody = {
        ...req.body,
        table: tables[0]
      };
      req.body = modifiedBody;
      
      return router.handle(req, res, router.stack.find(layer => 
        layer.route && layer.route.path === '/to-csv'
      ).handle);
    }

    // Check if we have enough join conditions
    if (tables.length > 1 && (!joinConditions || joinConditions.length < tables.length - 1)) {
      return res.status(400).json({ 
        success: false, 
        message: `Not enough join conditions provided. Need ${tables.length - 1} but got ${joinConditions ? joinConditions.length : 0}` 
      });
    }
    
    // Build the JOIN query
    const columnsString = selectedColumns.join(', ');
    const limitClause = limit ? `LIMIT ${limit}` : '';
    
    // Construct the JOIN part of the query
    // Assuming the first table is the main table and others are joined to it
    const mainTable = tables[0];
    let joinClause = `FROM ${database}.${mainTable}`;
    
    // Use ALL JOIN instead of regular JOIN to ensure we don't lose records
    for (let i = 1; i < tables.length; i++) {
      // Skip empty join conditions
      if (!joinConditions[i-1] || joinConditions[i-1].trim() === '') {
        continue;
      }
      joinClause += ` ALL JOIN ${database}.${tables[i]} ON ${joinConditions[i-1]}`;
    }
    
    const query = `SELECT ${columnsString} ${joinClause} ${limitClause}`;
    
    console.log("Executing join query:", query);
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });
    
    // Execute query
    const result = await client.query({
      query,
      format: 'JSONEachRow'
    });
    
    const data = await result.json();
    
    // Write data to CSV
    const outputPath = await writeToCsv(data, selectedColumns);
    
    // Return the CSV file path and record count
    return res.status(200).json({ 
      success: true, 
      filePath: outputPath.replace(/\\/g, '/'),
      count: data.length,
      message: `Successfully exported ${data.length} records to CSV with joined data`
    });
  } catch (error) {
    console.error('Error exporting joined data to CSV:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to export joined data: ${error.message}` 
    });
  }
});

// Preview data from ClickHouse
router.post('/preview', async (req, res) => {
  try {
    const { 
      host, port, protocol, database, username, password, jwt,
      table, selectedColumns, limit = 100
    } = req.body;
    
    // Build the query
    const columnsString = selectedColumns.join(', ');
    const query = `SELECT ${columnsString} FROM ${database}.${table} LIMIT ${limit}`;
    
    const client = createClickHouseClient({
      host,
      port,
      protocol,
      database,
      username,
      password,
      jwt
    });
    
    // Execute query
    const result = await client.query({
      query,
      format: 'JSONEachRow'
    });
    
    const data = await result.json();
    
    // Return the preview data
    return res.status(200).json({ 
      success: true, 
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Error previewing data:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to preview data: ${error.message}` 
    });
  }
});

module.exports = router; 