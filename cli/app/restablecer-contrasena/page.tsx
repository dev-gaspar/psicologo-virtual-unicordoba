"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { resetPasswordSchema } from "@/lib/validationSchemas";

export default function ResetPasswordPage() {
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<any>({});
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();
	const searchParams = useSearchParams();
	const requestId = searchParams.get("requestId");

	const [email, setEmail] = useState("");

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			router.push("/panel");
			return;
		}

		if (!requestId) {
			showError("ID de solicitud no válido");
			return;
		}

		// Obtener información de la solicitud (email)
		const fetchRecoveryInfo = async () => {
			try {
				const response = await apiClient.get(`/auth/recovery-info/${requestId}`);
				if (response.data.success) {
					setEmail(response.data.email);
				}
			} catch (error) {
				console.error("Error fetching recovery info:", error);
				showError("No se pudo obtener información de la solicitud");
			}
		};

		fetchRecoveryInfo();
	}, [requestId, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validar formulario con yup
		try {
			await resetPasswordSchema.validate(formData, { abortEarly: false });
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

			const recaptchaToken = await executeRecaptcha("reset_password");

			const response = await apiClient.post("/auth/reset-password", {
				codeReq: requestId,
				password: formData.password,
				recaptchaToken,
			});

			if (response.data.message === "PASUEX") {
				showSuccess(
					"Contraseña actualizada correctamente. Redirigiendo al inicio de sesión..."
				);
				setTimeout(() => router.push("/"), 2000);
			}
		} catch (err: any) {
			showError(err.message || "Error al actualizar la contraseña");
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
								<h2 className="brand-text mb-3">Cambiar Contraseña</h2>
								<p className="text-muted">
									Ingresa tu nueva contraseña segura.
								</p>
							</div>

							<form onSubmit={handleSubmit}>
								<div className="single-input has-label">
									<label htmlFor="email">Correo Electrónico</label>
									<i className="fas fa-envelope"></i>
									<input
										type="email"
										className="form-control"
										id="email"
										value={email}
										disabled
										readOnly
										style={{ backgroundColor: "#e9ecef" }}
									/>
								</div>
								<div className="single-input has-label">
									<label htmlFor="password">Nueva Contraseña</label>
									<i className="fas fa-key"></i>
									<input
										type="password"
										className={errors.password ? "is-invalid" : ""}
										id="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										autoComplete="off"
										placeholder="********"
									/>
									{errors.password && (
										<div className="invalid-feedback">{errors.password}</div>
									)}
									<small className="form-text text-muted d-block mt-2">
										<i className="fas fa-info-circle me-1"></i>
										8-15 caracteres, incluir mayúscula, minúscula, número y
										carácter especial
									</small>
								</div>

								<div className="single-input has-label">
									<label htmlFor="confirmPassword">
										Confirmar Nueva Contraseña
									</label>
									<i className="fas fa-check-double"></i>
									<input
										type="password"
										className={errors.confirmPassword ? "is-invalid" : ""}
										id="confirmPassword"
										value={formData.confirmPassword}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											})
										}
										autoComplete="off"
										placeholder="********"
									/>
									{errors.confirmPassword && (
										<div className="invalid-feedback">
											{errors.confirmPassword}
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
											Actualizando...
										</>
									) : (
										<>
											<i className="fas fa-save me-2"></i>Actualizar Contraseña
										</>
									)}
								</button>

								<div className="text-center">
									<small className="text-muted">
										<i className="fas fa-clock me-1"></i>El formulario expira en
										60 minutos
									</small>
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
