// Mensajes de error según código del backend
export const ERROR_MESSAGES: Record<string, string> = {
    // Auth/Login errors
    USRCCT: "Inicio de sesión exitoso",
    USRERR: "Usuario o contraseña incorrectos",
    USRNEX: "Usuario no existe",
    USRINV: "Credenciales inválidas",
    USNVLD: "Nombre de usuario no válido",
    PSWINC: "Contraseña incorrecta",
    PSWNVD: "Contraseña no válida",

    // Registration errors
    USRREX: "Registro exitoso",
    EMLYRG: "El correo electrónico ya está registrado",
    NUSYRG: "El nombre de usuario ya está registrado",
    FNMNVD: "Nombre completo no válido",
    EMLNVD: "Correo electrónico no válido",
    NUSNVD: "Nombre de usuario no válido",
    CTRNVD: "País no válido",
    ERRDSC: "Error desconocido en el registro",

    // Recovery errors
    CODGEN: "Código de verificación enviado",
    CDNEXP: "Ya existe una solicitud activa. Revisa tu correo",
    SUNEXP: "Ya existe una solicitud de actualización activa",
    EMLNEX: "El correo electrónico no está registrado",
    CODNEX: "Código no existe",
    CRQCOR: "Código verificado correctamente",
    CDNIGL: "El código ingresado es incorrecto",
    CDYEXP: "El código ha expirado. Solicita uno nuevo",
    CODNVD: "Código no válido",
    CRQNVD: "Solicitud no válida",
    CGNNVD: "Código generado no válido",
    CRQNEX: "Solicitud no existe",
    CRQINV: "Solicitud inválida",
    CRQEXP: "Solicitud expirada",
    CRQYUS: "Solicitud ya utilizada",

    // Password reset errors
    PASUEX: "Contraseña actualizada correctamente",
    PSWEQS: "La nueva contraseña no puede ser igual a la anterior",
    SLYEXP: "El formulario ha expirado. Solicita una nueva recuperación",
    PASNVD: "Contraseña no válida",

    // Session errors
    IDUNVD: "ID de usuario no válido",
    IDSNVD: "ID de sesión no válido",
    SESNEX: "Sesión no existe",
    SESCLS: "Sesión cerrada",
    SESOPN: "Sesión activa",
    SESCEX: "Sesión cerrada exitosamente",
    SESEXP: "Sesión expirada",

    // reCAPTCHA errors
    RCPINV: "Verificación de reCAPTCHA fallida",
    RCPERR: "Error al validar reCAPTCHA",

    // Generic errors
    ERRORE: "Error en el servidor",
    SRVERR: "Error en el servidor. Intente nuevamente",
    NETERR: "Error de conexión. Verifica tu internet",
    UNKERR: "Error desconocido. Intente nuevamente",
};

export const getErrorMessage = (code: string): string => {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKERR;
};
