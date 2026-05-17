const fetch = require('node-fetch');
const fs = require('fs');

const projectId = 'c24afc9c-3854-49d4-acb9-b8083cd28856';
const freelancerId = '4388c5e6-b754-4b52-98b1-b05972cc0572';

// Read token
let token = '';
try {
  token = fs.readFileSync('./scripts/test_token.txt', 'utf8').trim();
  console.log('Token found, length:', token.length);
} catch(e) {
  console.log('No token file found');
}

// Test endpoint
(async () => {
  try {
    console.log('Testing /projects/' + projectId);
    const res = await fetch('http://localhost:5000/projects/' + projectId, {
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch(err) {
    console.error('Error:', err.message);
  }
})();
