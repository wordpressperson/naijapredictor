const fs = require('fs');
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Ariketush2001%23@db.molnlndmlrtbakdkelxn.supabase.co:5432/postgres';

async function setup() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = fs.readFileSync('setup-db.sql', 'utf8');
    
    await client.query(sql);
    console.log('Database schema and functions created successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setup();
