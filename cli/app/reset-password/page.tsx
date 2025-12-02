"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();
	const searchParams = useSearchParams();
	const requestId = searchParams.get("requestId");

	useEffect(() => {
		if (!requestId) {
			setError("ID de solicitud no válido");
		}
	}, [requestId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		if (formData.password !== formData.confirmPassword) {
			setError("Las contraseñas no coinciden");
			setLoading(false);
			return;
		}

		try {
			if (!executeRecaptcha) {
				setError("reCAPTCHA no está disponible");
				setLoading(false);
				return;
			}

			const recaptchaToken = await executeRecaptcha("reset_password");

			const response = await axios.post(
				"http://localhost:8080/api/auth/reset-password",
				{
					codeReq: requestId,
					password: formData.password,
					recaptchaToken,
				}
			);

			if (response.data.message === "PASUEX") {
				setSuccess(
					"Contraseña actualizada correctamente. Redirigiendo al inicio de sesión..."
				);
				setTimeout(() => {
					router.push("/");
				}, 2000);
			} else if (response.data.message === "PSWEQS") {
				setError("La nueva contraseña no puede ser igual a la anterior.");
			} else if (response.data.message === "SLYEXP") {
				setError("El formulario ha expirado. Solicita una nueva recuperación.");
			} else {
				setError("Error al actualizar la contraseña.");
			}
		} catch (err) {
			setError("Error al actualizar la contraseña. Intente nuevamente.");
			console.error(err);
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
							<h2 className="text-center mb-4">Cambiar Contraseña</h2>
							<p className="text-center text-muted mb-4">
								Ingresa tu nueva contraseña.
							</p>

							{error && (
								<div className="alert alert-danger" role="alert">
									{error}
								</div>
							)}

							{success && (
								<div className="alert alert-success" role="alert">
									{success}
								</div>
							)}

							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label htmlFor="password" className="form-label">
										Nueva Contraseña
									</label>
									<input
										type="password"
										className="form-control"
										id="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										autoComplete="off"
										required
										minLength={8}
										maxLength={15}
									/>
									<small className="form-text text-muted">
										8-15 caracteres, debe incluir mayúscula, minúscula, número y
										carácter especial
									</small>
								</div>

								<div className="mb-3">
									<label htmlFor="confirmPassword" className="form-label">
										Confirmar Nueva Contraseña
									</label>
									<input
										type="password"
										className="form-control"
										id="confirmPassword"
										value={formData.confirmPassword}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											})
										}
										autoComplete="off"
										required
									/>
								</div>

								<button
									type="submit"
									className="btn btn-primary w-100 mb-3"
									disabled={loading}
								>
									{loading ? "Actualizando..." : "Actualizar Contraseña"}
								</button>

								<div className="text-center">
									<small className="text-muted">
										El formulario expira en 60 minutos
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
