import { supabaseAdmin } from './supabaseAdmin';

export interface AuditLogParams {
    action: string;
    entity_type: string;
    entity_id: string;
    old_data?: any;
    new_data?: any;
    user_id?: string;
    user_email?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: any;
}

export async function recordAuditLog(params: AuditLogParams) {
    try {
        const { error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                action: params.action,
                entity_type: params.entity_type,
                entity_id: params.entity_id,
                old_data: params.old_data,
                new_data: params.new_data,
                user_id: params.user_id,
                user_email: params.user_email,
                ip_address: params.ip_address,
                user_agent: params.user_agent,
                metadata: params.metadata,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Failed to insert audit log:', error);
            return { error };
        }

        return { success: true };
    } catch (err) {
        console.error('Audit Log Utility Error:', err);
        return { error: err };
    }
}
