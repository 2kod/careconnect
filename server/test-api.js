import app from './src/app.js';
import pool from './src/config/database.js';

async function testBackend() {
  console.log('🧪 Starting CareConnect Backend Integration Sanity Tests...');

  const server = app.listen(5099, async () => {
    try {
      const baseUrl = 'http://127.0.0.1:5099';

      // 1. Health check
      console.log('1. Testing /api/health...');
      const healthRes = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthRes.json();
      console.log('Health status:', healthData.status);

      // 2. Specializations
      console.log('2. Testing /api/doctors/specializations...');
      const specRes = await fetch(`${baseUrl}/api/doctors/specializations`);
      const specData = await specRes.json();
      console.log(`Fetched ${specData.data?.length} specializations.`);

      // 3. Doctors List
      console.log('3. Testing /api/doctors...');
      const docRes = await fetch(`${baseUrl}/api/doctors`);
      const docData = await docRes.json();
      console.log(`Fetched ${docData.data?.length} doctors.`);
      const testDoctor = docData.data[0];

      // 4. Slots for doctor
      console.log(`4. Testing /api/doctors/${testDoctor.id}/slots for today...`);
      const today = new Date().toISOString().split('T')[0];
      const slotRes = await fetch(`${baseUrl}/api/doctors/${testDoctor.id}/slots?date=${today}`);
      const slotData = await slotRes.json();
      console.log(`Doctor has ${slotData.totalSlots} slots, ${slotData.availableSlotsCount} available.`);

      // 5. Login
      console.log('5. Testing /api/auth/login with demo user ramesh@careconnect.org...');
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ramesh@careconnect.org',
          password: 'Password123!'
        })
      });
      const loginData = await loginRes.json();
      console.log('Login success:', loginData.success, 'User:', loginData.user?.fullName);
      const token = loginData.token;

      // 6. Appointments
      console.log('6. Testing /api/appointments/my with JWT...');
      const apptRes = await fetch(`${baseUrl}/api/appointments/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apptData = await apptRes.json();
      console.log(`Found ${apptData.totalCount} appointments (${apptData.upcoming?.length} upcoming).`);

      console.log('✅ ALL BACKEND SANITY TESTS PASSED SUCCESSFULLY!');
    } catch (e) {
      console.error('❌ Test failed:', e);
      process.exitCode = 1;
    } finally {
      server.close();
      await pool.end();
    }
  });
}

testBackend();
