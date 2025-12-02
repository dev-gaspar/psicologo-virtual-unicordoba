"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
	id: number;
	text: string;
	sender: "user" | "assistant";
	timestamp: string;
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
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Mock responses para demostración
	const mockResponses = [
		"Entiendo cómo te sientes. Es completamente normal sentirse así en momentos difíciles. ¿Podrías contarme más sobre lo que está pasando?",
		"Gracias por compartir eso conmigo. Tu bienestar emocional es importante. ¿Has considerado hablar con alguien sobre esto?",
		"Es valiente de tu parte buscar ayuda. Estoy aquí para apoyarte. ¿Qué te gustaría explorar más a fondo?",
		"Comprendo. A veces expresar nuestros sentimientos puede ser el primer paso hacia sentirnos mejor. ¿Hay algo específico que te preocupe en este momento?",
	];

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim() === "") return;

		// Agregar mensaje del usuario
		const userMessage: Message = {
			id: messages.length + 1,
			text: inputValue,
			sender: "user",
			timestamp: new Date().toLocaleTimeString("es-CO", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsTyping(true);

		// Simular respuesta del asistente (mockup)
		setTimeout(() => {
			const randomResponse =
				mockResponses[Math.floor(Math.random() * mockResponses.length)];
			const assistantMessage: Message = {
				id: messages.length + 2,
				text: randomResponse,
				sender: "assistant",
				timestamp: new Date().toLocaleTimeString("es-CO", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setIsTyping(false);
		}, 1500);
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
								<span className="status-indicator" aria-label="En línea" />
								Siempre disponible para ti
							</p>
						</div>
					</div>
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
			</footer>
		</div>
	);
}
