import { useEffect, useRef, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos de inactividad
const WARNING_LIMIT = 5 * 60 * 1000;     // 5 minutos de cuenta regresiva

export const useInactivityDetection = () => {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now()); // Para optimizar el evento mousemove
    const [isWarning, setIsWarning] = useState(false);

    // Función de Logout
    const logout = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // Cerrar cualquier modal abierto antes de redirigir
        if (Swal.isVisible()) {
            Swal.close();
        }

        router.push("/");

        Swal.fire({
            icon: "info",
            title: "Sesión cerrada",
            text: "Tu sesión ha expirado por inactividad.",
        });
    }, [router]);

    // Función para iniciar la alerta de advertencia (Countdown)
    const startWarning = useCallback(() => {
        setIsWarning(true);
        let timeLeft = WARNING_LIMIT / 1000; // Segundos restantes

        // Intervalo para actualizar el texto en negrita del SweetAlert
        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(interval);
                // El logout se maneja en el 'willClose' o 'then' del Swal, 
                // pero por seguridad si el Swal falla, lo llamamos aquí si sigue visible.
                if (Swal.isVisible()) {
                    logout();
                }
            } else {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                const timeString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

                if (Swal.isVisible()) {
                    const content = Swal.getHtmlContainer();
                    if (content) {
                        const b = content.querySelector("b");
                        if (b) {
                            b.textContent = timeString;
                        }
                    }
                }
            }
        }, 1000);

        Swal.fire({
            title: "Inactividad detectada",
            html: `Tu sesión se cerrará en <b>05:00</b> minutos por inactividad. <br/>¿Deseas continuar?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Continuar sesión",
            cancelButtonText: "Cerrar sesión",
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: WARNING_LIMIT,
            timerProgressBar: true,
            willClose: () => {
                clearInterval(interval);
            }
        }).then((result) => {
            clearInterval(interval);
            if (result.isConfirmed) {
                // Usuario decidió quedarse
                setIsWarning(false); // Esto disparará el useEffect para reiniciar el timer de 15 min
                apiClient.post("/auth/validate-token").catch(() => { });
            } else {
                // Canceló, se acabó el tiempo o cerró el modal manualmente
                logout();
            }
        });
    }, [logout]);

    // Función para resetear el timer principal (15 min)
    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        // Iniciamos el contador de 15 minutos
        timerRef.current = setTimeout(() => {
            startWarning();
        }, INACTIVITY_LIMIT);
    }, [startWarning]);

    useEffect(() => {
        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

        const handleActivity = () => {
            // Si ya estamos en modo advertencia, ignoramos la actividad del mouse
            // hasta que el usuario le de click a "Continuar" en el modal.
            if (isWarning) return;

            // OPTIMIZACIÓN: Throttling
            // Evita reiniciar el timer en cada pixel que se mueve el mouse.
            // Solo reinicia si ha pasado más de 1 segundo desde el último evento.
            const now = Date.now();
            if (now - lastActivityRef.current > 1000) {
                lastActivityRef.current = now;
                resetTimer();
            }
        };

        // Escuchar eventos
        events.forEach((event) => {
            document.addEventListener(event, handleActivity);
        });

        // Solo iniciamos el timer si NO estamos en advertencia
        if (!isWarning) {
            resetTimer();
        }

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isWarning, resetTimer]);

    return null;
};