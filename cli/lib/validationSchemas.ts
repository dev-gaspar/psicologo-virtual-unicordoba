import * as yup from "yup";

// Validaciones para Login
export const loginSchema = yup.object().shape({
    username: yup
        .string()
        .required("El nombre de usuario es requerido")
        .max(30, "El nombre de usuario no puede exceder 30 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
    password: yup.string().required("La contraseña es requerida"),
});

// Validaciones para Registro
export const registerSchema = yup.object().shape({
    fullName: yup
        .string()
        .required("El nombre completo es requerido")
        .max(300, "El nombre no puede exceder 300 caracteres")
        .matches(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            "Solo se permiten letras y espacios"
        ),
    email: yup
        .string()
        .required("El correo electrónico es requerido")
        .email("Ingrese un correo electrónico válido")
        .max(200, "El correo no puede exceder 200 caracteres"),
    username: yup
        .string()
        .required("El nombre de usuario es requerido")
        .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
        .max(30, "El nombre de usuario no puede exceder 30 caracteres")
        .matches(
            /^[a-zA-Z0-9_]+$/,
            "Solo letras, números y guiones bajos permitidos"
        ),
    password: yup
        .string()
        .required("La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(15, "La contraseña no puede exceder 15 caracteres")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            "Debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)"
        ),
    confirmPassword: yup
        .string()
        .required("Confirme su contraseña")
        .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
    country: yup
        .number()
        .typeError("Seleccione un país")
        .required("Seleccione un país")
        .positive("Seleccione un país válido"),
});

// Validaciones para Recuperar Contraseña
export const forgotPasswordSchema = yup.object().shape({
    email: yup
        .string()
        .required("El correo electrónico es requerido")
        .email("Ingrese un correo electrónico válido")
        .max(200, "El correo no puede exceder 200 caracteres"),
});

// Validaciones para Verificar Código
export const verifyCodeSchema = yup.object().shape({
    code: yup
        .string()
        .required("El código es requerido")
        .length(6, "El código debe tener exactamente 6 caracteres")
        .matches(/^[A-Z0-9]+$/, "Solo letras mayúsculas y números"),
});

// Validaciones para Restablecer Contraseña
export const resetPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .required("La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(15, "La contraseña no puede exceder 15 caracteres")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            "Debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)"
        ),
    confirmPassword: yup
        .string()
        .required("Confirme su contraseña")
        .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});
