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

// Interceptor de solicitudes
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Variable para controlar el refresco de token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor de respuestas
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError<any>) => {
        const originalRequest: any = error.config;

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

        // Si es un error 401 (no autorizado) y no es una reintento
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = "Bearer " + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/refresh-token`,
                        { refreshToken }
                    );

                    if (response.data.success) {
                        const newToken = response.data.token;
                        localStorage.setItem("token", newToken);
                        apiClient.defaults.headers.common["Authorization"] = "Bearer " + newToken;
                        originalRequest.headers["Authorization"] = "Bearer " + newToken;
                        processQueue(null, newToken);
                        isRefreshing = false;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;
                    // Fallthrough to logout
                }
            }
        }

        // Extraer código de error del backend
        const errorCode =
            error.response?.data?.message ||
            error.response?.data?.codemsg ||
            error.response?.data?.error ||
            "UNKERR";

        const errorMessage = getErrorMessage(errorCode);

        if (errorMessage) {
            // Rechazar con el error procesado (sin spread del error original)
            return Promise.reject({
                code: errorCode,
                message: errorMessage,
                status: error.response.status,
            });
        }

        // Si es un error 401 y falló el refresh o no había token
        if (error.response.status === 401) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");

            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }

            if (!originalRequest._retry) { // Solo mostrar alerta si no fue un intento de refresh fallido
                Swal.fire({
                    icon: "warning",
                    title: "Sesión expirada",
                    text: "Por favor, inicia sesión nuevamente",
                    confirmButtonColor: "#3085d6",
                });
            }

            return Promise.reject({
                code: "SESEXP",
                message: "Sesión expirada",
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;
