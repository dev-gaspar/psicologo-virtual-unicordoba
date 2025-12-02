"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useInactivityDetection } from "@/hooks/useInactivityDetection";

// Provider global solo para detección de inactividad
export function InactivityProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	useInactivityDetection();
	return <>{children}</>;
}

// Provider de reCAPTCHA solo para páginas públicas (login, registro, etc.)
export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
	return (
		<GoogleReCaptchaProvider
			reCaptchaKey={
				process.env.NEXT_PUBLIC_RECAPTCHA_KEY ||
				"6LdfPBgsAAAAAAbVKJZH4xEXKxvnnAQGraFRcOFI"
			}
		>
			{children}
		</GoogleReCaptchaProvider>
	);
}
