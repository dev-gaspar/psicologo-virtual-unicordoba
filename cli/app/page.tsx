"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { loginSchema } from "@/lib/validationSchemas";

export default function LoginPage() {
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
			<div className="split-left">
				<div className="split-content">
					<h1>Psicólogo Virtual</h1>
					<p>
						Asistente inteligente de apoyo psicológico para la comunidad de la
						Universidad de Córdoba. Tu compañero de bienestar emocional
						disponible 24/7.
					</p>
					<p className="mt-4">
						<small>© 2025 Universidad de Córdoba</small>
					</p>
				</div>
			</div>

			<div className="split-right">
				<div className="split-content">
					<div className="mb-5">
						<h2 className="brand-text mb-2">Iniciar Sesión</h2>
						<p className="text-muted">
							Ingresa tus credenciales para continuar
						</p>
					</div>

					<form onSubmit={handleSubmit}>
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

						<div className="text-end mb-3">
							<a href="/recuperar-contrasena" className="text-decoration-none">
								¿Olvidaste tu contraseña?
							</a>
						</div>

						<button
							type="submit"
							className="btn btn-primary w-100 mb-4"
							disabled={loading}
							aria-label="Iniciar sesión"
						>
							{loading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-2"
										role="status"
									></span>
									Iniciando sesión...
								</>
							) : (
								<>
									<i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
								</>
							)}
						</button>

						<div className="text-center">
							<span className="text-muted">¿No tienes cuenta? </span>
							<a href="/registro" className="text-decoration-none">
								Regístrate aquí
							</a>
						</div>

						<div className="text-center mt-4">
							<small className="text-muted">Protegido por reCAPTCHA v3</small>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
