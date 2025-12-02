"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			if (!executeRecaptcha) {
				setError("reCAPTCHA no está disponible");
				setLoading(false);
				return;
			}

			const recaptchaToken = await executeRecaptcha("forgot_password");

			const response = await axios.post(
				"http://localhost:8080/api/auth/request-recovery",
				{
					email,
					recaptchaToken,
				}
			);

			if (response.data.message === "CODGEN") {
				setSuccess(
					"Se ha enviado un código de verificación a tu correo electrónico."
				);
				setTimeout(() => {
					router.push(`/verify-code?requestId=${response.data.request_id}`);
				}, 2000);
			} else if (response.data.message === "CDNEXP") {
				setError("Ya existe una solicitud activa. Revisa tu correo.");
			} else if (response.data.message === "EMLNEX") {
				setError("El correo electrónico no está registrado.");
			} else {
				setError("Error al procesar la solicitud.");
			}
		} catch (err) {
			setError("Error al solicitar recuperación. Intente nuevamente.");
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
							<h2 className="text-center mb-4">Recuperar Contraseña</h2>
							<p className="text-center text-muted mb-4">
								Ingresa tu correo electrónico y te enviaremos un código de
								verificación.
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
									<label htmlFor="email" className="form-label">
										Correo Electrónico
									</label>
									<input
										type="email"
										className="form-control"
										id="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										autoComplete="off"
										required
									/>
								</div>

								<button
									type="submit"
									className="btn btn-primary w-100 mb-3"
									disabled={loading}
								>
									{loading ? "Enviando..." : "Enviar Código"}
								</button>

								<div className="text-center">
									<a href="/" className="text-decoration-none">
										Volver al inicio de sesión
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
