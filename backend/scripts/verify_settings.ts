import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function run() {
  try {
    // 1. Sign In / Sign Up
    console.log('Signing up/in...');
    const email = `test-settings-${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test Settings User';

    let cookieHeader = '';

    const regRes = await axios.post(`${API_URL}/api/auth/sign-up/email`, {
      email,
      password,
      name,
    });

    const cookies = regRes.headers['set-cookie'];
    if (cookies) {
      cookieHeader = cookies.map((c: string) => c.split(';')[0]).join('; ');
    } else {
      throw new Error('No cookies received');
    }

    console.log('Signed up & Logged in.');

    const headers = {
      Cookie: cookieHeader,
      Origin: API_URL,
    };

    // 2. Trigger lazy creation via /auth/me
    await axios.get(`${API_URL}/auth/me`, { headers });

    // 3. Get AI Config
    console.log('Fetching AI Config...');
    const getRes = await axios.get(`${API_URL}/settings/ai-config`, { headers });
    console.log('AI Config (Initial):', getRes.data);

    // 4. Update AI Config
    console.log('Updating AI Config...');
    const updateRes = await axios.post(
      `${API_URL}/settings/ai-config`,
      {
        autoReplyEnabled: true,
        autoReplyConfidenceThreshold: 0.85,
        autoReplySafeCategories: ['billing'],
        aiDraftEnabled: false,
        aiUsePastTickets: true,
      },
      { headers },
    );
    console.log('Update response:', updateRes.data);

    // 5. Verify Update
    console.log('Verifying Update...');
    const verifyRes = await axios.get(`${API_URL}/settings/ai-config`, { headers });
    const config = verifyRes.data;
    if (
      config.autoReplyEnabled === true &&
      config.autoReplyConfidenceThreshold === 0.85 &&
      config.aiDraftEnabled === false
    ) {
      console.log('✅ Settings updated successfully!');
    } else {
      console.error('❌ Settings mismatch:', config);
      process.exit(1);
    }

    // 6. Get Email Config (check inbound address generation)
    console.log('Fetching Email Config...');
    const emailRes = await axios.get(`${API_URL}/settings/email-config`, { headers });
    console.log('Email Config:', emailRes.data);
    if (emailRes.data.inboundAddress && emailRes.data.inboundSecret) {
      console.log('✅ Inbound address generated!');
    } else {
      console.error('❌ Inbound address missing');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Test failed:', error.response?.data || error.message);
    if (error.response?.data) console.error(JSON.stringify(error.response.data, null, 2));
    process.exit(1);
  }
}

run();
