/**
 * Utilidades de validación y sanitización para prevenir inyección SQL y XSS
 */

// Caracteres peligrosos que pueden usarse en inyección SQL o XSS
const SQL_INJECTION_PATTERNS = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,  // Comillas simples y comentarios SQL
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,  // Patrones de inyección
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,  // Palabras clave SQL
    /(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|onerror|onload)/gi,
];

const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // Tags script
    /javascript:/gi,  // Protocolo javascript
    /on\w+\s*=/gi,  // Eventos inline (onclick, onerror, etc.)
    /<iframe/gi,  // iframes
    /<object/gi,  // objects
    /<embed/gi,  // embeds
];

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos
 */
export function sanitizeText(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    let sanitized = input;

    // Eliminar tags HTML
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Escapar caracteres especiales HTML
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    // Eliminar caracteres de control y especiales peligrosos
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    return sanitized.trim();
}

/**
 * Valida que no contenga patrones de inyección SQL
 */
export function validateNoSQLInjection(input: string): boolean {
    if (typeof input !== 'string') {
        return false;
    }

    for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(input)) {
            return false;
        }
    }

    return true;
}

/**
 * Valida que no contenga patrones de XSS
 */
export function validateNoXSS(input: string): boolean {
    if (typeof input !== 'string') {
        return false;
    }

    for (const pattern of XSS_PATTERNS) {
        if (pattern.test(input)) {
            return false;
        }
    }

    return true;
}

/**
 * Valida y sanitiza un número
 */
export function validateAndSanitizeNumber(
    input: string,
    min?: number,
    max?: number,
    maxLength?: number
): { isValid: boolean; value: number | null; error?: string } {
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(input.trim())) {
        return { isValid: false, value: null, error: 'Solo se permiten números' };
    }

    // Verificar longitud máxima
    if (maxLength && input.length > maxLength) {
        return { isValid: false, value: null, error: `Máximo ${maxLength} dígitos` };
    }

    const num = parseInt(input, 10);

    // Verificar que sea un número válido
    if (isNaN(num)) {
        return { isValid: false, value: null, error: 'Número inválido' };
    }

    // Verificar rango mínimo
    if (min !== undefined && num < min) {
        return { isValid: false, value: null, error: `El valor mínimo es ${min}` };
    }

    // Verificar rango máximo
    if (max !== undefined && num > max) {
        return { isValid: false, value: null, error: `El valor máximo es ${max}` };
    }

    return { isValid: true, value: num };
}

/**
 * Valida y sanitiza un texto
 */
export function validateAndSanitizeText(
    input: string,
    minLength: number = 2,
    maxLength: number = 500
): { isValid: boolean; value: string; error?: string } {
    if (typeof input !== 'string') {
        return { isValid: false, value: '', error: 'Entrada inválida' };
    }

    // Sanitizar primero
    const sanitized = sanitizeText(input);

    // Verificar longitud mínima
    if (sanitized.length < minLength) {
        return {
            isValid: false,
            value: sanitized,
            error: `Mínimo ${minLength} caracteres`
        };
    }

    // Verificar longitud máxima
    if (sanitized.length > maxLength) {
        return {
            isValid: false,
            value: sanitized,
            error: `Máximo ${maxLength} caracteres`
        };
    }

    // Verificar inyección SQL
    if (!validateNoSQLInjection(sanitized)) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Contiene caracteres no permitidos'
        };
    }

    // Verificar XSS
    if (!validateNoXSS(sanitized)) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Contiene código malicioso'
        };
    }

    return { isValid: true, value: sanitized };
}

/**
 * Valida y sanitiza un textarea (permite más caracteres)
 */
export function validateAndSanitizeTextarea(
    input: string,
    minLength: number = 0,
    maxLength: number = 2000
): { isValid: boolean; value: string; error?: string } {
    if (typeof input !== 'string') {
        return { isValid: false, value: '', error: 'Entrada inválida' };
    }

    // Sanitizar
    const sanitized = sanitizeText(input);

    // Verificar longitud máxima
    if (sanitized.length > maxLength) {
        return {
            isValid: false,
            value: sanitized,
            error: `Máximo ${maxLength} caracteres`
        };
    }

    // Si es opcional y está vacío, es válido
    if (minLength === 0 && sanitized.length === 0) {
        return { isValid: true, value: sanitized };
    }

    // Verificar longitud mínima
    if (sanitized.length < minLength) {
        return {
            isValid: false,
            value: sanitized,
            error: `Mínimo ${minLength} caracteres`
        };
    }

    // Verificar inyección SQL
    if (!validateNoSQLInjection(sanitized)) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Contiene caracteres no permitidos'
        };
    }

    // Verificar XSS
    if (!validateNoXSS(sanitized)) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Contiene código malicioso'
        };
    }

    return { isValid: true, value: sanitized };
}

/**
 * Valida un email con expresión regular segura
 */
export function validateEmail(email: string): { isValid: boolean; value: string; error?: string } {
    if (typeof email !== 'string') {
        return { isValid: false, value: '', error: 'Email inválido' };
    }

    const sanitized = email.trim().toLowerCase();

    // Patrón de email seguro y estricto
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(sanitized)) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Formato de email inválido'
        };
    }

    // Verificar longitud razonable
    if (sanitized.length > 254) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Email demasiado largo'
        };
    }

    // Verificar patrones peligrosos
    if (!validateNoSQLInjection(sanitized) || !validateNoXSS(sanitized)) {
        return {
            isValid: false,
            value: sanitized,
            error: 'Email contiene caracteres no permitidos'
        };
    }

    return { isValid: true, value: sanitized };
}

/**
 * Valida una fecha
 */
export function validateDate(dateString: string): { isValid: boolean; value: string; error?: string } {
    if (typeof dateString !== 'string') {
        return { isValid: false, value: '', error: 'Fecha inválida' };
    }

    // Verificar formato YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateString)) {
        return {
            isValid: false,
            value: dateString,
            error: 'Formato de fecha inválido'
        };
    }

    const date = new Date(dateString);

    // Verificar que sea una fecha válida
    if (isNaN(date.getTime())) {
        return {
            isValid: false,
            value: dateString,
            error: 'Fecha inválida'
        };
    }

    // Verificar rango razonable (entre 1900 y 2100)
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
        return {
            isValid: false,
            value: dateString,
            error: 'Año fuera de rango válido'
        };
    }

    return { isValid: true, value: dateString };
}

/**
 * Valida opciones de selección (evita valores no permitidos)
 */
export function validateOption(
    value: string,
    allowedOptions: string[]
): { isValid: boolean; value: string; error?: string } {
    if (typeof value !== 'string') {
        return { isValid: false, value: '', error: 'Opción inválida' };
    }

    // Verificar que la opción esté en la lista permitida
    if (!allowedOptions.includes(value)) {
        return {
            isValid: false,
            value: '',
            error: 'Opción no permitida'
        };
    }

    return { isValid: true, value };
}

/**
 * Valida múltiples opciones
 */
export function validateMultipleOptions(
    values: string[],
    allowedOptions: string[]
): { isValid: boolean; value: string[]; error?: string } {
    if (!Array.isArray(values)) {
        return { isValid: false, value: [], error: 'Selección inválida' };
    }

    // Verificar que todas las opciones estén en la lista permitida
    const validValues = values.filter(v =>
        typeof v === 'string' && allowedOptions.includes(v)
    );

    if (validValues.length !== values.length) {
        return {
            isValid: false,
            value: validValues,
            error: 'Algunas opciones no son válidas'
        };
    }

    return { isValid: true, value: validValues };
}
