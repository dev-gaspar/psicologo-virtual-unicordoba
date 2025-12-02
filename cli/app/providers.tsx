"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<GoogleReCaptchaProvider reCaptchaKey="6LdfPBgsAAAAAAbVKJZH4xEXKxvnnAQGraFRcOFI">
			{children}
		</GoogleReCaptchaProvider>
	);
}
