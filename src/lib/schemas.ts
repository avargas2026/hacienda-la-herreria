/**
 * Validation Schemas using Zod
 * 
 * Este archivo centraliza todas las validaciones de datos de la aplicación.
 * Cada schema define las reglas de validación y tipos TypeScript automáticos.
 */

import { z } from 'zod';

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

/**
 * Schema para crear una nueva reserva
 */
export const createBookingSchema = z.object({
    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .trim()
        .refine((val) => val.length > 0, 'El nombre es requerido'),

    email: z
        .string()
        .email('Email inválido')
        .toLowerCase()
        .trim(),

    phone: z
        .string()
        .regex(
            /^\+?[1-9]\d{1,14}$/,
            'Teléfono inválido. Formato: +573001234567'
        )
        .optional()
        .or(z.literal('')),

    start_date: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Fecha de inicio inválida'),

    end_date: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Fecha de fin inválida'),

    guests: z
        .number()
        .int('El número de huéspedes debe ser un entero')
        .min(1, 'Debe haber al menos 1 huésped')
        .max(20, 'Máximo 20 huéspedes permitidos'),

    total: z
        .string()
        .optional(),

    status: z
        .enum(['pending', 'confirmed', 'cancelled', 'pending_event'])
        .default('pending'),
}).refine(
    (data) => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return end > start;
    },
    {
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['end_date'],
    }
);

/**
 * Schema para confirmar una reserva
 */
export const confirmBookingSchema = z.object({
    bookingId: z
        .string()
        .uuid('ID de reserva inválido'),

    email: z
        .string()
        .email('Email inválido')
        .toLowerCase(),

    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .trim(),

    dates: z
        .string()
        .refine(
            (val) => val.includes(' - '),
            'Formato de fechas inválido. Esperado: "YYYY-MM-DD - YYYY-MM-DD"'
        ),

    total: z
        .string()
        .optional(),
});

/**
 * Schema para actualizar una reserva
 */
export const updateBookingSchema = z.object({
    bookingId: z
        .string()
        .uuid('ID de reserva inválido'),

    status: z
        .enum(['pending', 'confirmed', 'cancelled', 'pending_event'])
        .optional(),

    name: z
        .string()
        .min(2)
        .max(100)
        .trim()
        .optional(),

    email: z
        .string()
        .email()
        .toLowerCase()
        .optional(),

    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),

    start_date: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)))
        .optional(),

    end_date: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)))
        .optional(),

    guests: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional(),
});

/**
 * Schema para eliminar una reserva
 */
export const deleteBookingSchema = z.object({
    bookingId: z
        .string()
        .uuid('ID de reserva inválido'),
});

// ============================================================================
// CONTACT/VISITOR SCHEMAS
// ============================================================================

/**
 * Schema para tracking de visitantes
 */
export const visitorTrackingSchema = z.object({
    ip: z
        .string()
        .regex(
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i,
            'IP inválida'
        )
        .optional(),

    city: z
        .string()
        .max(100)
        .optional(),

    country: z
        .string()
        .max(100)
        .optional(),

    device: z
        .string()
        .max(500)
        .optional(),

    referrer: z
        .string()
        .max(500)
        .optional(),

    duration: z
        .number()
        .int()
        .min(0)
        .default(0),

    sections_visited: z
        .array(z.string())
        .default([]),
});

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

/**
 * Schema para login
 */
export const loginSchema = z.object({
    email: z
        .string()
        .email('Email inválido')
        .toLowerCase(),

    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/**
 * Schema para registro con contraseña fuerte
 */
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .trim(),

    email: z
        .string()
        .email('Email inválido')
        .toLowerCase(),

    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(
            /[A-Z]/,
            'La contraseña debe contener al menos una letra mayúscula'
        )
        .regex(
            /[a-z]/,
            'La contraseña debe contener al menos una letra minúscula'
        )
        .regex(
            /[0-9]/,
            'La contraseña debe contener al menos un número'
        )
        .regex(
            /[^A-Za-z0-9]/,
            'La contraseña debe contener al menos un carácter especial'
        ),
});

/**
 * Schema para recuperación de contraseña
 */
export const passwordRecoverySchema = z.object({
    email: z
        .string()
        .email('Email inválido')
        .toLowerCase(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper para formatear errores de Zod de forma amigable
 */
export function formatZodError(error: z.ZodError<any>): Array<{ field: string; message: string }> {
    return error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
}

/**
 * Helper para validar y retornar datos o error
 */
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        errors: formatZodError(result.error),
    };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Exportar tipos TypeScript inferidos de los schemas
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type DeleteBookingInput = z.infer<typeof deleteBookingSchema>;
export type VisitorTrackingInput = z.infer<typeof visitorTrackingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordRecoveryInput = z.infer<typeof passwordRecoverySchema>;
