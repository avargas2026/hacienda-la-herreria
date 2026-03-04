import { supabaseAdmin } from './src/lib/supabaseAdmin.ts';

async function deleteUser() {
    const email = 'vargas2005@gmail.com';
    console.log(`Searching for user to delete: ${email}...`);

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log(`Found user with ID: ${user.id}. Deleting...`);
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
        } else {
            console.log('✅ User deleted successfully.');
        }
    } else {
        console.log('❌ User not found.');
    }
}

deleteUser();
