"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { forgotPasswordSchema } from "@/lib/validationSchemas";
import { RecaptchaProvider } from "../providers";

function ForgotPasswordPageContent() {
	const [email, setEmail] = useState("");
	const [errors, setErrors] = useState<any>({});
	const [touched, setTouched] = useState<any>({});
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			router.push("/panel");
		}
	}, [router]);

	// Validación en tiempo real
	useEffect(() => {
		const validateField = async () => {
			try {
				await forgotPasswordSchema.validate({ email }, { abortEarly: false });
				setErrors({});
			} catch (err: any) {
				const validationErrors: any = {};
				err.inner.forEach((error: any) => {
					if (touched[error.path]) {
						validationErrors[error.path] = error.message;
					}
				});
				setErrors(validationErrors);
			}
		};

		if (Object.keys(touched).length > 0) {
			validateField();
		}
	}, [email, touched]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validar formulario con yup
		try {
			await forgotPasswordSchema.validate({ email }, { abortEarly: false });
		} catch (err: any) {
			const validationErrors: any = {};
			err.inner.forEach((error: any) => {
				validationErrors[error.path] = error.message;
			});
			setErrors(validationErrors);
			return;
		}

		setLoading(true);

		try {
			if (!executeRecaptcha) {
				showError("reCAPTCHA no está disponible");
				setLoading(false);
				return;
			}

			const recaptchaToken = await executeRecaptcha("forgot_password");

			const response = await apiClient.post("/auth/request-recovery", {
				email,
				recaptchaToken,
			});

			if (response.data.message === "CODGEN") {
				showSuccess(
					"Se ha enviado un código de verificación a tu correo electrónico. Por favor revisa tu bandeja de entrada."
				);
				// No redirigir, el usuario debe ir a su correo
			}
		} catch (err: any) {
			showError(err.message || "Error al solicitar recuperación");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="row justify-content-center align-items-center min-vh-100">
				<div className="col-md-5">
					<div className="card shadow">
						<div className="card-body p-5">
							<div className="mb-4">
								<h2 className="brand-text mb-3">Recuperar Contraseña</h2>
								<p className="text-muted">
									Ingresa tu correo electrónico y te enviaremos un código de
									verificación.
								</p>
							</div>

							<form onSubmit={handleSubmit}>
								<div className="single-input has-label">
									<label htmlFor="email">Correo Electrónico</label>
									<i className="fas fa-envelope" aria-hidden="true"></i>
									<input
										type="email"
										className={errors.email ? "is-invalid" : ""}
										id="email"
										name="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										onBlur={() => setTouched({ ...touched, email: true })}
										autoComplete="email"
										placeholder="correo@ejemplo.com"
										aria-label="Correo electrónico"
										aria-invalid={errors.email ? "true" : "false"}
										aria-describedby={errors.email ? "email-error" : undefined}
										required
									/>
									{errors.email && (
										<div
											className="invalid-feedback"
											id="email-error"
											role="alert"
										>
											{errors.email}
										</div>
									)}
								</div>

								<button
									type="submit"
									className="btn btn-primary w-100 mb-3"
									disabled={loading}
								>
									{loading ? (
										<>
											<span
												className="spinner-border spinner-border-sm me-2"
												role="status"
											></span>
											Enviando...
										</>
									) : (
										<>
											<i className="fas fa-paper-plane me-2"></i>Enviar Código
										</>
									)}
								</button>

								<div className="text-center">
									<a href="/" className="text-decoration-none">
										<i className="fas fa-arrow-left me-2"></i>Volver al inicio
										de sesión
									</a>
								</div>
							</form>

							<div className="text-center mt-4">
								<small className="text-muted">Protegido por reCAPTCHA v3</small>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ForgotPasswordPage() {
	return (
		<RecaptchaProvider>
			<ForgotPasswordPageContent />
		</RecaptchaProvider>
	);
}
