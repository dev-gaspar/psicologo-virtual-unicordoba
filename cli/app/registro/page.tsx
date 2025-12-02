"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { registerSchema } from "@/lib/validationSchemas";
import { RecaptchaProvider } from "../providers";

function RegisterPageContent() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
		country: "",
	});
	const [countries, setCountries] = useState<any[]>([]);
	const [errors, setErrors] = useState<any>({});
	const [touched, setTouched] = useState<any>({});
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			router.push("/panel");
			return;
		}
	}, [router]);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await apiClient.get("/countries");
				setCountries(response.data);
			} catch (err) {
				showError("Error al cargar países");
			}
		};
		fetchCountries();
	}, []);

	// Validación en tiempo real
	useEffect(() => {
		const validateField = async () => {
			try {
				await registerSchema.validate(formData, { abortEarly: false });
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
			await registerSchema.validate(formData, { abortEarly: false });
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

			const recaptchaToken = await executeRecaptcha("register");

			const response = await apiClient.post("/auth/register", {
				fullName: formData.fullName,
				email: formData.email,
				username: formData.username,
				password: formData.password,
				idCountry: parseInt(formData.country),
				recaptchaToken,
			});

			if (response.data.message === "USRREX") {
				showSuccess("¡Registro exitoso! Redirigiendo al inicio de sesión...");
				setTimeout(() => router.push("/"), 2000);
			} else {
				showError("Error en el registro. Verifique los datos.");
			}
		} catch (err: any) {
			showError(err.message || "Error al registrarse");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="row justify-content-center align-items-center min-vh-100 py-4 py-md-5">
				<div className="col-12 col-md-9 col-lg-8 col-xl-7">
					<div className="card shadow-lg border-0">
						<div className="card-body p-4 p-md-5">
							{/* Header */}
							<div className="text-center mb-4">
								<i
									className="fas fa-user-plus fs-1 mb-3"
									aria-hidden="true"
									style={{ color: "var(--primary-green)" }}
								></i>
								<h1 className="brand-text h3 mb-2">Registro de Usuario</h1>
								<p className="text-muted mb-0">
									Crea tu cuenta para acceder a la plataforma
								</p>
							</div>

							<form onSubmit={handleSubmit} noValidate>
								<div className="row g-3">
									<div className="col-12 col-md-6">
										<div className="single-input has-label">
											<label htmlFor="fullName">Nombre Completo</label>
											<i className="fas fa-id-card" aria-hidden="true"></i>
											<input
												type="text"
												className={errors.fullName ? "is-invalid" : ""}
												id="fullName"
												name="fullName"
												value={formData.fullName}
												onChange={(e) =>
													setFormData({ ...formData, fullName: e.target.value })
												}
												onBlur={() =>
													setTouched({ ...touched, fullName: true })
												}
												autoComplete="name"
												placeholder="Juan Pérez García"
												aria-label="Nombre completo"
												aria-invalid={errors.fullName ? "true" : "false"}
												aria-describedby={
													errors.fullName ? "fullName-error" : undefined
												}
												required
											/>
											{errors.fullName && (
												<div
													className="invalid-feedback"
													id="fullName-error"
													role="alert"
												>
													{errors.fullName}
												</div>
											)}
										</div>
									</div>

									<div className="col-12 col-md-6">
										<div className="single-input has-label">
											<label htmlFor="email">Correo Electrónico</label>
											<i className="fas fa-envelope" aria-hidden="true"></i>
											<input
												type="email"
												className={errors.email ? "is-invalid" : ""}
												id="email"
												name="email"
												value={formData.email}
												onChange={(e) =>
													setFormData({ ...formData, email: e.target.value })
												}
												onBlur={() => setTouched({ ...touched, email: true })}
												autoComplete="email"
												placeholder="correo@ejemplo.com"
												aria-label="Correo electrónico"
												aria-invalid={errors.email ? "true" : "false"}
												aria-describedby={
													errors.email ? "email-error" : undefined
												}
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
									</div>
								</div>

								<div className="row">
									<div className="col-12 col-md-6">
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
												onBlur={() =>
													setTouched({ ...touched, username: true })
												}
												autoComplete="username"
												placeholder="usuario123"
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

									<div className="col-12 col-md-6">
										<div className="single-input has-label">
											<label htmlFor="country">País</label>
											<i className="fas fa-globe" aria-hidden="true"></i>
											<select
												className={errors.country ? "is-invalid" : ""}
												id="country"
												name="country"
												value={formData.country}
												onChange={(e) =>
													setFormData({ ...formData, country: e.target.value })
												}
												onBlur={() => setTouched({ ...touched, country: true })}
												aria-label="País"
												aria-invalid={errors.country ? "true" : "false"}
												aria-describedby={
													errors.country ? "country-error" : undefined
												}
												required
											>
												<option value="">Seleccione un país</option>
												{countries.map((country) => (
													<option
														key={country.idCountry}
														value={country.idCountry}
													>
														{country.country}
													</option>
												))}
											</select>
											{errors.country && (
												<div
													className="invalid-feedback"
													id="country-error"
													role="alert"
												>
													{errors.country}
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="row">
									<div className="col-12 col-md-6">
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
												onBlur={() =>
													setTouched({ ...touched, password: true })
												}
												autoComplete="new-password"
												placeholder="********"
												aria-label="Contraseña"
												aria-invalid={errors.password ? "true" : "false"}
												aria-describedby={
													errors.password
														? "password-error password-hint"
														: "password-hint"
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

									<div className="col-12 col-md-6">
										<div className="single-input has-label">
											<label htmlFor="confirmPassword">
												Confirmar Contraseña
											</label>
											<i className="fas fa-check-double" aria-hidden="true"></i>
											<input
												type="password"
												className={errors.confirmPassword ? "is-invalid" : ""}
												id="confirmPassword"
												name="confirmPassword"
												value={formData.confirmPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmPassword: e.target.value,
													})
												}
												onBlur={() =>
													setTouched({ ...touched, confirmPassword: true })
												}
												autoComplete="new-password"
												placeholder="********"
												aria-label="Confirmar contraseña"
												aria-invalid={errors.confirmPassword ? "true" : "false"}
												aria-describedby={
													errors.confirmPassword
														? "confirmPassword-error"
														: undefined
												}
												required
											/>
											{errors.confirmPassword && (
												<div
													className="invalid-feedback"
													id="confirmPassword-error"
													role="alert"
												>
													{errors.confirmPassword}
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="d-grid gap-2 mt-4">
									<button
										type="submit"
										className="btn btn-primary"
										disabled={loading}
										aria-label={
											loading ? "Registrando, por favor espere" : "Crear cuenta"
										}
									>
										{loading ? (
											<>
												<span
													className="spinner-border spinner-border-sm me-2"
													role="status"
													aria-hidden="true"
												></span>
												<span>Registrando...</span>
											</>
										) : (
											<>
												<i
													className="fas fa-user-check me-2"
													aria-hidden="true"
												></i>
												<span>Crear Cuenta</span>
											</>
										)}
									</button>
								</div>

								<div className="text-center mt-3">
									<span className="text-muted">¿Ya tienes cuenta? </span>
									<a
										href="/"
										className="text-decoration-none fw-semibold"
										aria-label="Ir a la página de inicio de sesión"
									>
										<i
											className="fas fa-sign-in-alt me-1"
											aria-hidden="true"
										></i>
										Iniciar Sesión
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

export default function RegisterPage() {
	return (
		<RecaptchaProvider>
			<RegisterPageContent />
		</RecaptchaProvider>
	);
}
