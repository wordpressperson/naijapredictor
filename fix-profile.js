const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const WebSocket = require('ws');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket }
});

async function fixProfiles() {
  console.log('Fetching users from auth.users...');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  const users = authData.users;
  console.log(`Found ${users.length} users in auth.`);

  for (const user of users) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.log(`Profile missing for user ${user.email}. Creating...`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          points: 10,
          is_admin: user.email === 'aquilaayokunle@outlook.com'
        });

      if (insertError) {
        console.error(`Error creating profile for ${user.email}:`, insertError);
      } else {
        console.log(`Successfully created profile for ${user.email}`);
      }
    } else {
      console.log(`Profile already exists for ${user.email}. is_admin: ${profile.is_admin}`);
      if (user.email === 'aquilaayokunle@outlook.com' && !profile.is_admin) {
        console.log(`Updating ${user.email} to be admin...`);
        await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
      }
    }
  }
}

fixProfiles();
