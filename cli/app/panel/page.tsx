"use client";

import Link from "next/link";

export default function DashboardPage() {
	return (
		<div className="dashboard-container">
			{/* Skip to main content link para accesibilidad */}
			<a href="#main-content" className="skip-to-main">
				Saltar al contenido principal
			</a>

			{/* Header */}
			<header className="dashboard-header" role="banner">
				<h1 className="dashboard-title">
					Bienvenido al Asistente Psicológico Virtual
				</h1>
				<p className="dashboard-subtitle">
					Universidad de Córdoba - Apoyo emocional y bienestar estudiantil
				</p>
			</header>

			{/* Main Content */}
			<div className="dashboard-grid">
				{/* Card de bienvenida */}
				<div className="dashboard-card card-welcome" role="article">
					<div className="card-icon" aria-hidden="true">
						<i className="fas fa-hand-holding-heart" />
					</div>
					<h2 className="card-title">¿Cómo podemos ayudarte hoy?</h2>
					<p className="card-description">
						Este es un espacio seguro y confidencial donde puedes expresar tus
						preocupaciones, recibir orientación y encontrar recursos de apoyo
						emocional.
					</p>
				</div>

				{/* Card del asistente */}
				<Link
					href="/panel/chat"
					className="dashboard-card card-assistant"
					role="article"
					aria-label="Iniciar conversación con el asistente virtual"
				>
					<div className="card-icon" aria-hidden="true">
						<i className="fas fa-comments" />
					</div>
					<h2 className="card-title">Asistente Virtual</h2>
					<p className="card-description">
						Inicia una conversación confidencial con nuestro asistente
						psicológico. Disponible 24/7 para escucharte y orientarte.
					</p>
					<span className="card-action">
						Iniciar conversación{" "}
						<i className="fas fa-arrow-right" aria-hidden="true" />
					</span>
				</Link>

				{/* Card de recursos */}
				<div className="dashboard-card card-resources" role="article">
					<div className="card-icon" aria-hidden="true">
						<i className="fas fa-book-medical" />
					</div>
					<h2 className="card-title">Recursos de Apoyo</h2>
					<p className="card-description">
						Accede a artículos, técnicas de manejo emocional y recursos de
						bienestar universitario.
					</p>
					<span className="card-badge">Próximamente</span>
				</div>
			</div>

			{/* Info Section */}
			<section className="info-section" aria-labelledby="info-title">
				<h2 id="info-title" className="info-title">
					Sobre este servicio
				</h2>
				<div className="info-content">
					<div className="info-item">
						<i className="fas fa-lock" aria-hidden="true" />
						<h3>Confidencial</h3>
						<p>
							Tus conversaciones son privadas y seguras. No compartimos tu
							información personal.
						</p>
					</div>
					<div className="info-item">
						<i className="fas fa-clock" aria-hidden="true" />
						<h3>Disponible 24/7</h3>
						<p>
							Accede al asistente en cualquier momento que lo necesites, sin
							citas previas.
						</p>
					</div>
					<div className="info-item">
						<i className="fas fa-heart" aria-hidden="true" />
						<h3>Apoyo Profesional</h3>
						<p>
							Desarrollado con criterios psicológicos para brindarte orientación
							de calidad.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
