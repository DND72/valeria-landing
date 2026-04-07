import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/staff/clients', {
      headers: {
        'x-staff-verify': 'true' // Assuming backend might have a dev bypass or I need to check how it validates
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
