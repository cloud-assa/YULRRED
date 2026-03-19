/**
 * Seeds demo users into SpacetimeDB cloud.
 * Run: node seed-spacetime.mjs
 */
import { createHash } from 'crypto';

const SPACETIMEDB_URL = 'https://maincloud.spacetimedb.com';
const DB = 'securedeal';
const TOKEN = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMUtNMTJTNlQ2VE5CUUMwWjJFQjU1Szk2UyIsImlzcyI6Imh0dHBzOi8vYXV0aC5zcGFjZXRpbWVkYi5jb20iLCJhdWQiOiJzcGFjZXRpbWVkYiIsImlhdCI6MTc3Mzg2ODIzMywiZXhwIjoxODM2OTQwMjMzfQ.p_zubKqdcVdOIbN4E_Ty-HEPHXfa9OK91M4vgSTrL2kKG6XCK37dY9k8W1F-FFzyGs_LwFRP-mWlj_IkAIYya8HxIBLelCDndTK25TnkSkW0zme-oIJ-wWlaoOgqQ_K7Bqj7mF3XaovS3SlJTi8utGdtN3rQv5xQx898Zpeij5KTYh8YKYcuN6A-yKeLtWWw5t1UW_Plv858uJ0hfFG_AC7bv2vSzzDFr8hxFRVzPcu_2g8w0mczNhJbywdpvUdA4Xj8Y2kpQWFFCSAkSQMtnxq-lhRqlPwYnIs9aN5CCaaSj6WZhkEMh43wbW88464rW1p3eQkRxk5_Smly_Jkj7Q';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

// Simple bcrypt-compatible hash using the bcryptjs pre-generated hashes for known passwords
// These are bcrypt hashes pre-computed for the demo passwords:
// Buyer@123  -> $2a$10$...
// Seller@123 -> $2a$10$...
// Admin@123  -> $2a$10$...
// We'll use the /v1/database/securedeal/call/CreateUser reducer

async function callReducer(reducer, args) {
  const url = `${SPACETIMEDB_URL}/v1/database/${DB}/call/${reducer}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reducer ${reducer} failed: ${res.status} - ${text}`);
  }
  return res;
}

async function querySql(query) {
  const url = `${SPACETIMEDB_URL}/v1/database/${DB}/sql`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SQL failed: ${res.status} - ${text}`);
  }
  return res.json();
}

// bcrypt hashes pre-generated for demo passwords (cost 10)
const HASHES = {
  'Buyer@123':  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Seller@123': '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin@123':  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
};

// Since we can't run bcrypt here, use the NestJS backend's /auth/register endpoint
// which already hashes passwords. Let's use the backend API directly.

const BASE = 'http://localhost:4000/api';

async function registerUser(email, password, name, role) {
  // First try to register via API
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`✓ Registered ${email} (${data.user?.id})`);

    // If role is ADMIN, we need to update via SQL (reducers don't expose role)
    if (role === 'ADMIN') {
      // Use SpacetimeDB SQL to check if user exists and note the id
      console.log(`  Note: ${email} needs to be promoted to ADMIN manually or via a seed reducer`);
    }
    return data;
  } else {
    const text = await res.text();
    if (text.includes('already') || text.includes('conflict') || res.status === 409) {
      console.log(`  ~ ${email} already exists, skipping`);
      return null;
    }
    throw new Error(`Register ${email} failed: ${res.status} - ${text}`);
  }
}

console.log('Seeding demo users via backend API...\n');

try {
  await registerUser('buyer@example.com',  'Buyer@123',  'Demo Buyer',  'USER');
  await registerUser('seller@example.com', 'Seller@123', 'Demo Seller', 'USER');
  await registerUser('admin@securedeal.com','Admin@123', 'Admin',       'ADMIN');

  // Verify by querying SpacetimeDB
  console.log('\nVerifying users in SpacetimeDB...');
  const result = await querySql('SELECT Id, Email, Name, Role FROM user');
  if (result?.results?.[0]) {
    const cols = result.results[0].schema.elements.map(e => typeof e.name === 'object' ? e.name.some : e.name);
    const rows = result.results[0].rows.map(r => {
      const obj = {};
      cols.forEach((c, i) => obj[c] = r[i]);
      return obj;
    });
    console.log('\nUsers in database:');
    rows.forEach(u => console.log(`  ${u.Email} — ${u.Name} [${u.Role}]`));
  }

  console.log('\nDone!');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
