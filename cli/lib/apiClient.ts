import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Swal from "sweetalert2";
import { getErrorMessage } from "./errorMessages";

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor de respuestas
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError<any>) => {
        // Error de red
        if (!error.response) {
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: getErrorMessage("NETERR"),
                confirmButtonColor: "#3085d6",
            });
            return Promise.reject({
                code: "NETERR",
                message: getErrorMessage("NETERR"),
            });
        }

        // Extraer código de error del backend
        const errorCode =
            error.response?.data?.message ||
            error.response?.data?.codemsg ||
            error.response?.data?.error ||
            "UNKERR";

        const errorMessage = getErrorMessage(errorCode);

        // Rechazar con el error procesado
        if (errorMessage) {
            return Promise.reject({
                ...error,
                code: errorCode,
                message: errorMessage,
            });
        }

        // Si es un error 401 (no autorizado), redirigir al login
        if (error.response.status === 401) {
            localStorage.removeItem("user");
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
            Swal.fire({
                icon: "warning",
                title: "Sesión expirada",
                text: "Por favor, inicia sesión nuevamente",
                confirmButtonColor: "#3085d6",
            });
            return Promise.reject({
                code: "SESEXP",
                message: "Sesión expirada",
            });
        }

        return Promise.reject({
            ...error,
            code: "UNKERR",
            message: getErrorMessage("UNKERR"),
        });
    }
);

export default apiClient;
