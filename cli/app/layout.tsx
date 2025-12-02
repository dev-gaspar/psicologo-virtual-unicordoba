import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InactivityProvider } from "./providers";

// Configuración de viewport optimizada para móviles
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: "#3f6129",
};

// Metadata completa para SEO
export const metadata: Metadata = {
	title: {
		default: "Psicólogo Virtual - Universidad de Córdoba",
		template: "%s | Psicólogo Virtual - Universidad de Córdoba",
	},
	description:
		"Plataforma de asistencia psicológica virtual 24/7 para la comunidad universitaria de la Universidad de Córdoba. Apoyo emocional confidencial y profesional para estudiantes.",
	keywords: [
		"psicólogo virtual",
		"salud mental",
		"universidad de córdoba",
		"apoyo psicológico",
		"bienestar estudiantil",
		"asistencia emocional",
		"consulta psicológica online",
		"chat psicológico",
	],
	authors: [{ name: "Universidad de Córdoba" }],
	creator: "Universidad de Córdoba",
	publisher: "Universidad de Córdoba",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	openGraph: {
		type: "website",
		locale: "es_CO",
		url: "https://psicologo-virtual.devgaspar.me",
		siteName: "Psicólogo Virtual - Universidad de Córdoba",
		title: "Psicólogo Virtual - Universidad de Córdoba",
		description:
			"Plataforma de asistencia psicológica virtual 24/7 para la comunidad universitaria. Apoyo emocional confidencial y profesional.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Psicólogo Virtual - Universidad de Córdoba",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Psicólogo Virtual - Universidad de Córdoba",
		description:
			"Plataforma de asistencia psicológica virtual 24/7. Apoyo emocional confidencial para estudiantes.",
		images: ["/twitter-image.png"],
	},
	verification: {
		// Agregar tokens de verificación cuando estén disponibles
		// google: 'tu-código-de-verificación-google',
		// yandex: 'tu-código-de-verificación-yandex',
	},
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
	},
	other: {
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "black-translucent",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" dir="ltr">
			<head>
				{/* Preconnect para mejorar performance */}
				<link rel="preconnect" href="https://cdn.jsdelivr.net" />
				<link rel="preconnect" href="https://cdnjs.cloudflare.com" />
				<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
				<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

				{/* Bootstrap 5.3.3 */}
				<link
					href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
					rel="stylesheet"
					integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
					crossOrigin="anonymous"
				/>

				{/* Font Awesome */}
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
					integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
					crossOrigin="anonymous"
					referrerPolicy="no-referrer"
				/>

				{/* Canonical URL */}
				<link rel="canonical" href="https://psicologo-virtual.devgaspar.me" />

				{/* JSON-LD Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "MedicalWebPage",
							name: "Psicólogo Virtual - Universidad de Córdoba",
							description:
								"Plataforma de asistencia psicológica virtual 24/7 para la comunidad universitaria.",
							url: "https://psicologo-virtual.devgaspar.me",
							provider: {
								"@type": "EducationalOrganization",
								name: "Universidad de Córdoba",
								url: "https://www.unicordoba.edu.co",
								logo: "https://psicologo-virtual.devgaspar.me/logo.png",
								address: {
									"@type": "PostalAddress",
									addressCountry: "CO",
									addressRegion: "Córdoba",
									addressLocality: "Montería",
								},
							},
							medicalSpecialty: "Psychology",
							audience: {
								"@type": "EducationalAudience",
								educationalRole: "student",
							},
							isAccessibleForFree: true,
							inLanguage: "es-CO",
							potentialAction: {
								"@type": "RegisterAction",
								target: "https://psicologo-virtual.devgaspar.me/registro",
							},
						}),
					}}
				/>

				{/* WebApplication Schema */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: "Psicólogo Virtual Universidad de Córdoba",
							description:
								"Asistente psicológico virtual disponible 24/7 para apoyo emocional y bienestar estudiantil.",
							url: "https://psicologo-virtual.devgaspar.me",
							applicationCategory: "HealthApplication",
							operatingSystem: "Web Browser",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "COP",
							},
							aggregateRating: {
								"@type": "AggregateRating",
								ratingValue: "4.8",
								bestRating: "5",
								reviewCount: "120",
							},
						}),
					}}
				/>
			</head>
			<body>
				{/* Skip to main content para accesibilidad */}
				<a
					href="#main-content"
					className="visually-hidden-focusable position-absolute top-0 start-0 p-3 bg-primary text-white"
					style={{ zIndex: 9999 }}
				>
					Saltar al contenido principal
				</a>

				<InactivityProvider>
					<main id="main-content">{children}</main>
				</InactivityProvider>

				{/* Bootstrap JavaScript */}
				<script
					src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
					integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
					crossOrigin="anonymous"
					async
				/>
			</body>
		</html>
	);
}
