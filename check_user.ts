import { supabaseAdmin } from './src/lib/supabaseAdmin.ts';

async function checkUser() {
    const email = 'vargas2005@gmail.com';
    console.log(`Checking for user: ${email}...`);

    // Check Auth Users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log('✅ User found in Supabase Auth:');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Created at: ${user.created_at}`);
        console.log(`Last sign in: ${user.last_sign_in_at}`);
        console.log(`Metadata:`, user.user_metadata);
    } else {
        console.log('❌ User NOT found in Supabase Auth.');
    }
}

checkUser();
