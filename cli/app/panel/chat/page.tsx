"use client";

import { useState, useRef, useEffect } from "react";
import {
	sendChatMessage,
	checkAIHealth,
	resetChatSession,
} from "@/lib/chatService";
import Swal from "sweetalert2";

interface Message {
	id: number;
	text: string;
	sender: "user" | "assistant";
	timestamp: string;
	emotion?: string;
}

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: 1,
			text: "Hola, soy tu asistente psicológico virtual de la Universidad de Córdoba. Estoy aquí para escucharte y apoyarte. ¿Cómo te sientes hoy?",
			sender: "assistant",
			timestamp: new Date().toLocaleTimeString("es-CO", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isAIConnected, setIsAIConnected] = useState(false);
	const [sessionId] = useState(() => `session-${Date.now()}`);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Verificar conexión con el servidor de AI al cargar
	useEffect(() => {
		const checkConnection = async () => {
			const isHealthy = await checkAIHealth();
			setIsAIConnected(isHealthy);
			if (!isHealthy) {
				Swal.fire({
					icon: "warning",
					title: "Servidor de AI desconectado",
					text: "El servicio de inteligencia artificial no está disponible. Por favor, verifica que esté ejecutándose.",
					confirmButtonColor: "#3085d6",
				});
			}
		};
		checkConnection();
	}, []);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim() === "") return;

		const messageText = inputValue.trim();

		// Agregar mensaje del usuario
		const userMessage: Message = {
			id: messages.length + 1,
			text: messageText,
			sender: "user",
			timestamp: new Date().toLocaleTimeString("es-CO", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsTyping(true);

		try {
			// Enviar mensaje al AI backend
			const response = await sendChatMessage(messageText, sessionId);

			// Agregar respuesta del asistente
			const assistantMessage: Message = {
				id: messages.length + 2,
				text: response.advice,
				sender: "assistant",
				timestamp: new Date().toLocaleTimeString("es-CO", {
					hour: "2-digit",
					minute: "2-digit",
				}),
				emotion: response.emotion,
			};

			setMessages((prev) => [...prev, assistantMessage]);
			setIsAIConnected(true);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Error desconocido";

			Swal.fire({
				icon: "error",
				title: "Error al enviar mensaje",
				text: errorMessage,
				confirmButtonColor: "#3085d6",
			});

			setIsAIConnected(false);
		} finally {
			setIsTyping(false);
		}
	};

	const handleResetSession = async () => {
		const result = await Swal.fire({
			icon: "question",
			title: "Reiniciar conversación",
			text: "¿Estás seguro de que deseas reiniciar la conversación? Se perderá todo el historial.",
			showCancelButton: true,
			confirmButtonText: "Sí, reiniciar",
			cancelButtonText: "Cancelar",
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
		});

		if (result.isConfirmed) {
			try {
				await resetChatSession(sessionId);
				setMessages([
					{
						id: 1,
						text: "Hola, soy tu asistente psicológico virtual de la Universidad de Córdoba. Estoy aquí para escucharte y apoyarte. ¿Cómo te sientes hoy?",
						sender: "assistant",
						timestamp: new Date().toLocaleTimeString("es-CO", {
							hour: "2-digit",
							minute: "2-digit",
						}),
					},
				]);
				Swal.fire({
					icon: "success",
					title: "Conversación reiniciada",
					text: "La conversación ha sido reiniciada exitosamente.",
					confirmButtonColor: "#3085d6",
					timer: 2000,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Error desconocido";
				Swal.fire({
					icon: "error",
					title: "Error",
					text: errorMessage,
					confirmButtonColor: "#3085d6",
				});
			}
		}
	};

	return (
		<div className="chat-container">
			{/* Chat Header */}
			<header className="chat-header" role="banner">
				<div className="chat-header-content">
					<div className="chat-assistant-info">
						<div className="chat-assistant-avatar" aria-hidden="true">
							<i className="fas fa-robot" />
						</div>
						<div>
							<h1 className="chat-assistant-name">Asistente Psicológico</h1>
							<p className="chat-assistant-status">
								<span
									className="status-indicator"
									aria-label={isAIConnected ? "En línea" : "Desconectado"}
									style={{
										backgroundColor: isAIConnected ? "#10b981" : "#ef4444",
									}}
								/>
								{isAIConnected ? "Conectado" : "Desconectado"}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleResetSession}
						className="reset-chat-btn"
						aria-label="Reiniciar conversación"
						title="Reiniciar conversación"
					>
						<i className="fas fa-redo" aria-hidden="true" />
					</button>
				</div>
			</header>

			{/* Chat Messages */}
			<main
				className="chat-messages"
				role="main"
				aria-live="polite"
				aria-atomic="false"
			>
				<div className="messages-container">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`message-wrapper ${
								message.sender === "user" ? "message-user" : "message-assistant"
							}`}
							role="article"
							aria-label={`Mensaje de ${
								message.sender === "user" ? "usuario" : "asistente"
							}`}
						>
							{message.sender === "assistant" && (
								<div className="message-avatar" aria-hidden="true">
									<i className="fas fa-robot" />
								</div>
							)}
							<div className="message-content">
								<div
									className={`message-bubble ${
										message.sender === "user"
											? "message-bubble-user"
											: "message-bubble-assistant"
									}`}
								>
									<p>{message.text}</p>
								</div>
								<span className="message-time">{message.timestamp}</span>
							</div>
							{message.sender === "user" && (
								<div className="message-avatar" aria-hidden="true">
									<i className="fas fa-user-circle" />
								</div>
							)}
						</div>
					))}

					{/* Indicador de escritura */}
					{isTyping && (
						<div
							className="message-wrapper message-assistant"
							role="status"
							aria-live="polite"
						>
							<div className="message-avatar" aria-hidden="true">
								<i className="fas fa-robot" />
							</div>
							<div className="message-content">
								<div className="message-bubble message-bubble-assistant typing-indicator">
									<span />
									<span />
									<span />
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>
			</main>

			{/* Chat Input */}
			<footer className="chat-footer" role="contentinfo">
				<form onSubmit={handleSendMessage} className="chat-input-form">
					<label htmlFor="chat-input" className="visually-hidden">
						Escribe tu mensaje
					</label>
					<input
						id="chat-input"
						ref={inputRef}
						type="text"
						className="chat-input"
						placeholder="Escribe tu mensaje aquí..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						disabled={isTyping}
						aria-label="Campo de texto para escribir mensaje"
						autoComplete="off"
					/>
					<button
						type="submit"
						className="chat-send-btn"
						disabled={inputValue.trim() === "" || isTyping}
						aria-label="Enviar mensaje"
					>
						<i className="fas fa-paper-plane" aria-hidden="true" />
					</button>
				</form>
				<div className="chat-disclaimer">
					<i className="fas fa-info-circle" aria-hidden="true" />
					<span>
						{isTyping
							? "El asistente está procesando tu mensaje. Esto puede tomar unos momentos..."
							: "Este es un asistente de apoyo emocional. No sustituye atención profesional."}
					</span>
				</div>
			</footer>
		</div>
	);
}
