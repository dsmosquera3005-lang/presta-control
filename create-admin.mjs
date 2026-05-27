import fetch from 'node-fetch';

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmY2twa21reGJ1dHZidWtndGNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyNTM3MywiZXhwIjoyMDk1MzAxMzczfQ.o5sfDue8iOs_JWJiksD3Cz-8Vy0jwljky61LLmmFr30';

async function createAdmin() {
  try {
    const response = await fetch('https://jfckpkmkxbutvbukgtce.supabase.co/auth/v1/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey,
      },
      body: JSON.stringify({
        email: 'dantiny3005@gmail.com',
        password: 'D@nte3005',
        email_confirm: true,
        user_metadata: {
          full_name: 'Administrador',
          role: 'admin'
        }
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Admin user created successfully');
      console.log('Email: dantiny3005@gmail.com');
      console.log('Password: D@nte3005');
    } else {
      console.error('❌ Error:', data.message || data.error);
    }
  } catch (error) {
    console.error('Failed:', error);
  }
}

createAdmin();
