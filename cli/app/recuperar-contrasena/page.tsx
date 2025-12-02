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
			<div className="row justify-content-center align-items-center min-vh-100 py-3 py-sm-4 py-md-5">
				<div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
					<div className="card shadow-lg border-0">
						<div className="card-body p-4 p-md-5">
							<div className="text-center mb-4">
								<i
									className="fas fa-key fs-1 mb-3"
									aria-hidden="true"
									style={{ color: "var(--primary-green)" }}
								></i>
								<h1 className="brand-text h3 mb-2">Recuperar Contraseña</h1>
								<p className="text-muted mb-0">
									Ingresa tu correo electrónico y te enviaremos un código de
									verificación
								</p>
							</div>

							<form onSubmit={handleSubmit} noValidate>
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

								<div className="d-grid gap-2">
									<button
										type="submit"
										className="btn btn-primary"
										disabled={loading}
										aria-label={
											loading
												? "Enviando código, por favor espere"
												: "Enviar código de recuperación"
										}
									>
										{loading ? (
											<>
												<span
													className="spinner-border spinner-border-sm me-2"
													role="status"
													aria-hidden="true"
												></span>
												<span>Enviando...</span>
											</>
										) : (
											<>
												<i
													className="fas fa-paper-plane me-2"
													aria-hidden="true"
												></i>
												<span>Enviar Código</span>
											</>
										)}
									</button>
								</div>

								<div className="text-center mt-3">
									<a
										href="/"
										className="text-decoration-none"
										aria-label="Volver a la página de inicio de sesión"
									>
										<i
											className="fas fa-arrow-left me-2"
											aria-hidden="true"
										></i>
										Volver al inicio de sesión
									</a>
								</div>
							</form>

							<div className="text-center mt-4">
								<small className="text-muted d-flex align-items-center justify-content-center gap-2">
									<i className="fas fa-shield-alt" aria-hidden="true"></i>
									<span>Protegido por reCAPTCHA v3</span>
								</small>
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
