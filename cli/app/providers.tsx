"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useInactivityDetection } from "@/hooks/useInactivityDetection";

export function Providers({ children }: { children: React.ReactNode }) {
    useInactivityDetection();
    
	return (
		<GoogleReCaptchaProvider reCaptchaKey="6LdfPBgsAAAAAAbVKJZH4xEXKxvnnAQGraFRcOFI">
			{children}
		</GoogleReCaptchaProvider>
	);
}
