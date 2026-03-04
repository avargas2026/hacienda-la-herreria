import { supabaseAdmin } from './src/lib/supabaseAdmin.ts';

async function listRecentUsers() {
    console.log(`Listing 5 most recent users...`);

    // Check Auth Users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    const sortedUsers = users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    sortedUsers.slice(0, 5).forEach(user => {
        console.log(`Email: ${user.email} | Created: ${user.created_at} | Verified: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
    });
}

listRecentUsers();
