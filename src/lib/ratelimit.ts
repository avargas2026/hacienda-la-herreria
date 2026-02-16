import { supabaseAdmin } from './supabaseAdmin';

/**
 * Rate Limiter usando Supabase (PostgreSQL)
 * 
 * Esta versión utiliza la base de datos de Supabase para rastrear el número de peticiones
 * por IP, evitando la necesidad de servicios externos como Redis.
 */

const LIMIT = 10; // Máximo de peticiones
const WINDOW_SECONDS = 60; // Ventana de tiempo (1 minuto)

export async function checkRateLimit(identifier: string) {
    try {
        const now = new Date();

        // 1. Intentar obtener el registro actual para esta IP/Identificador
        const { data: record, error: fetchError } = await supabaseAdmin
            .from('api_rate_limits')
            .select('*')
            .eq('key', identifier)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error de base de datos en rate limit:', fetchError);
            return { success: true }; // Fallamos hacia adelante (permitir) en caso de error técnico
        }

        if (!record) {
            // 2. Si no existe, creamos el primer registro
            const resetAt = new Date(now.getTime() + WINDOW_SECONDS * 1000);
            await supabaseAdmin.from('api_rate_limits').insert({
                key: identifier,
                count: 1,
                reset_at: resetAt.toISOString()
            });
            return { success: true, remaining: LIMIT - 1 };
        }

        const resetAt = new Date(record.reset_at);

        if (now > resetAt) {
            // 3. La ventana de tiempo ya pasó, reseteamos el contador
            const newResetAt = new Date(now.getTime() + WINDOW_SECONDS * 1000);
            await supabaseAdmin
                .from('api_rate_limits')
                .update({
                    count: 1,
                    reset_at: newResetAt.toISOString()
                })
                .eq('key', identifier);
            return { success: true, remaining: LIMIT - 1 };
        }

        if (record.count >= LIMIT) {
            // 4. Se superó el límite
            console.warn(`🛡️ Rate limit excedido para: ${identifier}`);
            return { success: false, remaining: 0 };
        }

        // 5. Incrementar el contador
        await supabaseAdmin
            .from('api_rate_limits')
            .update({ count: record.count + 1 })
            .eq('key', identifier);

        return { success: true, remaining: LIMIT - (record.count + 1) };

    } catch (error) {
        console.error('Error crítico en lógica de rate limit:', error);
        return { success: true }; // En caso de fallo total, permitimos la operación
    }
}
