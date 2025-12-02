"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { loginSchema } from "@/lib/validationSchemas";
import { RecaptchaProvider } from "./providers";

function LoginPageContent() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
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
				await loginSchema.validate(formData, { abortEarly: false });
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
	}, [formData, touched]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validar formulario con yup
		try {
			await loginSchema.validate(formData, { abortEarly: false });
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

			const recaptchaToken = await executeRecaptcha("login");

			const response = await apiClient.post("/auth/login", {
				username: formData.username,
				password: formData.password,
				recaptchaToken,
			});

			if (response.data.codemsg === "USRCCT") {
				localStorage.setItem("user", JSON.stringify(response.data.datauser));
				if (response.data.datauser.token) {
					localStorage.setItem("token", response.data.datauser.token);
				}
				if (response.data.datauser.refreshToken) {
					localStorage.setItem(
						"refreshToken",
						response.data.datauser.refreshToken
					);
				}
				showSuccess("Inicio de sesión exitoso");
				setTimeout(() => router.push("/panel"), 1000);
			} else {
				showError("Usuario o contraseña incorrectos");
			}
		} catch (err: any) {
			showError(err.message || "Error al iniciar sesión");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="split-screen">
			{/* Left Panel - Hidden on mobile */}
			<div className="split-left d-none d-lg-flex">
				<div className="split-content">
					<h1 className="display-4 fw-bold mb-4">Psicólogo Virtual</h1>
					<p className="lead">
						Asistente inteligente de apoyo psicológico para la comunidad de la
						Universidad de Córdoba. Tu compañero de bienestar emocional
						disponible 24/7.
					</p>
					<div className="mt-5">
						<div className="d-flex align-items-center gap-3 mb-3">
							<i className="fas fa-shield-alt fs-4" aria-hidden="true"></i>
							<span>Confidencial y Seguro</span>
						</div>
						<div className="d-flex align-items-center gap-3 mb-3">
							<i className="fas fa-clock fs-4" aria-hidden="true"></i>
							<span>Disponible 24/7</span>
						</div>
						<div className="d-flex align-items-center gap-3">
							<i className="fas fa-user-md fs-4" aria-hidden="true"></i>
							<span>Apoyo Profesional</span>
						</div>
					</div>
					<p className="mt-5 mb-0">
						<small>© 2025 Universidad de Córdoba</small>
					</p>
				</div>
			</div>

			{/* Right Panel - Login Form */}
			<div className="split-right">
				<div className="split-content">
					{/* Logo mobile */}
					<div className="text-center d-lg-none mb-4">
						<i
							className="fas fa-brain text-primary fs-1 mb-3"
							aria-hidden="true"
						></i>
						<h1 className="h4 text-primary fw-bold">Psicólogo Virtual</h1>
					</div>

					<div className="mb-4 mb-md-5">
						<h2 className="brand-text mb-2 h3 h2-md">Iniciar Sesión</h2>
						<p className="text-muted mb-0">
							Ingresa tus credenciales para continuar
						</p>
					</div>

					<form onSubmit={handleSubmit} noValidate>
						<div className="mb-3">
							<div className="single-input has-label">
								<label htmlFor="username">Usuario</label>
								<i className="fas fa-user" aria-hidden="true"></i>
								<input
									type="text"
									className={errors.username ? "is-invalid" : ""}
									id="username"
									name="username"
									value={formData.username}
									onChange={(e) =>
										setFormData({ ...formData, username: e.target.value })
									}
									onBlur={() => setTouched({ ...touched, username: true })}
									autoComplete="username"
									placeholder="Ingrese su usuario"
									aria-label="Usuario"
									aria-invalid={errors.username ? "true" : "false"}
									aria-describedby={
										errors.username ? "username-error" : undefined
									}
									required
								/>
								{errors.username && (
									<div
										className="invalid-feedback"
										id="username-error"
										role="alert"
									>
										{errors.username}
									</div>
								)}
							</div>
						</div>

						<div className="mb-3">
							<div className="single-input has-label">
								<label htmlFor="password">Contraseña</label>
								<i className="fas fa-lock" aria-hidden="true"></i>
								<input
									type="password"
									className={errors.password ? "is-invalid" : ""}
									id="password"
									name="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									onBlur={() => setTouched({ ...touched, password: true })}
									autoComplete="current-password"
									placeholder="Ingrese su contraseña"
									aria-label="Contraseña"
									aria-invalid={errors.password ? "true" : "false"}
									aria-describedby={
										errors.password ? "password-error" : undefined
									}
									required
								/>
								{errors.password && (
									<div
										className="invalid-feedback"
										id="password-error"
										role="alert"
									>
										{errors.password}
									</div>
								)}
							</div>
						</div>

						<div className="text-end mb-4">
							<a
								href="/recuperar-contrasena"
								className="text-decoration-none small"
								aria-label="Recuperar contraseña olvidada"
							>
								<i className="fas fa-key me-1" aria-hidden="true"></i>
								¿Olvidaste tu contraseña?
							</a>
						</div>

						<button
							type="submit"
							className="btn btn-primary w-100 mb-4"
							disabled={loading}
							aria-label={
								loading
									? "Iniciando sesión, por favor espere"
									: "Iniciar sesión"
							}
						>
							{loading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-2"
										role="status"
										aria-hidden="true"
									></span>
									<span>Iniciando sesión...</span>
								</>
							) : (
								<>
									<i className="fas fa-sign-in-alt me-2" aria-hidden="true"></i>
									<span>Iniciar Sesión</span>
								</>
							)}
						</button>

						<div className="text-center mb-4">
							<span className="text-muted">¿No tienes cuenta? </span>
							<a
								href="/registro"
								className="text-decoration-none fw-semibold"
								aria-label="Ir a la página de registro"
							>
								<i className="fas fa-user-plus me-1" aria-hidden="true"></i>
								Regístrate aquí
							</a>
						</div>

						<div className="text-center">
							<small className="text-muted d-flex align-items-center justify-content-center gap-2">
								<i className="fas fa-shield-alt" aria-hidden="true"></i>
								<span>Protegido por reCAPTCHA v3</span>
							</small>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<RecaptchaProvider>
			<LoginPageContent />
		</RecaptchaProvider>
	);
}
