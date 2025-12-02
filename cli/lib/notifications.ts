import Swal from "sweetalert2";

export const showSuccess = (message: string, title: string = "¡Éxito!") => {
    Swal.fire({
        icon: "success",
        title,
        text: message,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
    });
};

export const showError = (message: string, title: string = "Error") => {
    Swal.fire({
        icon: "error",
        title,
        text: message,
        confirmButtonColor: "#3085d6",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
    });
};

export const showWarning = (message: string, title: string = "Advertencia") => {
    Swal.fire({
        icon: "warning",
        title,
        text: message,
        confirmButtonColor: "#3085d6",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
    });
};

export const showInfo = (message: string, title: string = "Información") => {
    Swal.fire({
        icon: "info",
        title,
        text: message,
        confirmButtonColor: "#3085d6",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
    });
};

// Para modales dentro del panel (más grandes y centrados)
export const showModalSuccess = (
    message: string,
    title: string = "¡Éxito!"
) => {
    return Swal.fire({
        icon: "success",
        title,
        text: message,
        confirmButtonColor: "#3085d6",
    });
};

export const showModalError = (message: string, title: string = "Error") => {
    return Swal.fire({
        icon: "error",
        title,
        text: message,
        confirmButtonColor: "#3085d6",
    });
};

export const showConfirm = (
    message: string,
    title: string = "¿Estás seguro?"
) => {
    return Swal.fire({
        title,
        text: message,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
    });
};
