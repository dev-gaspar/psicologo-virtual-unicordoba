import axios, { AxiosError } from "axios";

// Crear una instancia separada para el servicio de AI/chat
// que no pasa por los interceptores de autenticación del apiClient principal
const chatApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000",
    timeout: 0,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface ChatMessage {
    text: string;
    session_id?: string;
}

export interface ChatResponse {
    emotion: string;
    advice: string;
    session_id: string;
}

export interface EmotionPrediction {
    label: string;
    probability: number;
    top_k: Array<{
        label: string;
        prob: number;
    }>;
}

/**
 * Envía un mensaje al chatbot y obtiene una respuesta con análisis de emoción
 */
export const sendChatMessage = async (
    message: string,
    sessionId: string = "default"
): Promise<ChatResponse> => {
    try {
        const response = await chatApiClient.post<ChatResponse>("/coach", {
            text: message,
            session_id: sessionId,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<any>;

        if (axiosError.response) {
            throw new Error(
                axiosError.response.data?.detail ||
                "Error al procesar el mensaje"
            );
        } else if (axiosError.request) {
            throw new Error(
                "No se pudo conectar con el servidor de AI. Verifica que el servicio esté ejecutándose."
            );
        } else {
            throw new Error("Error al enviar el mensaje");
        }
    }
};

/**
 * Predice la emoción de un texto sin generar respuesta
 */
export const predictEmotion = async (
    text: string,
    topK: number = 3
): Promise<EmotionPrediction> => {
    try {
        const response = await chatApiClient.post<EmotionPrediction>("/predict", {
            text,
            top_k: topK,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<any>;

        if (axiosError.response) {
            throw new Error(
                axiosError.response.data?.detail ||
                "Error al predecir emoción"
            );
        } else if (axiosError.request) {
            throw new Error(
                "No se pudo conectar con el servidor de AI"
            );
        } else {
            throw new Error("Error al analizar emoción");
        }
    }
};

/**
 * Verifica la salud del servidor de AI
 */
export const checkAIHealth = async (): Promise<boolean> => {
    try {
        const response = await chatApiClient.get("/health");
        return response.data?.status === "ok";
    } catch (error) {
        return false;
    }
};

/**
 * Reinicia una sesión de chat (limpia el historial)
 */
export const resetChatSession = async (
    sessionId: string = "default"
): Promise<void> => {
    try {
        await chatApiClient.delete(`/coach/session?session_id=${sessionId}`);
    } catch (error) {
        const axiosError = error as AxiosError<any>;
        throw new Error(
            axiosError.response?.data?.detail ||
            "Error al reiniciar la sesión"
        );
    }
};
