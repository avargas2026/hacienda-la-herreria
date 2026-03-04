import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { recordAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        const { action, entity_type, entity_id, old_data, new_data, adminEmail } = body;

        if (!action || !entity_type || !entity_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await recordAuditLog({
            action,
            entity_type,
            entity_id,
            old_data,
            new_data,
            user_email: adminEmail || 'Unknown',
            ip_address: ip,
            user_agent: userAgent
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Audit API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
