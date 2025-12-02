"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyCodePage() {
	const [code, setCode] = useState("");
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

		try {
			if (!executeRecaptcha) {
				setError("reCAPTCHA no está disponible");
				setLoading(false);
				return;
			}

			const recaptchaToken = await executeRecaptcha("verify_code");

			const response = await axios.post(
				"http://localhost:8080/api/auth/verify-code",
				{
					codeReq: requestId,
					codeGen: code,
					recaptchaToken,
				}
			);

			if (response.data.message === "CRQCOR") {
				setSuccess("Código verificado correctamente. Redirigiendo...");
				setTimeout(() => {
					router.push(`/reset-password?requestId=${requestId}`);
				}, 2000);
			} else if (response.data.message === "CDNIGL") {
				setError("El código ingresado es incorrecto.");
			} else if (response.data.message === "CDYEXP") {
				setError("El código ha expirado. Solicita uno nuevo.");
			} else {
				setError("Error al verificar el código.");
			}
		} catch (err) {
			setError("Error al verificar el código. Intente nuevamente.");
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
							<h2 className="text-center mb-4">Verificar Código</h2>
							<p className="text-center text-muted mb-4">
								Ingresa el código de 6 caracteres que recibiste en tu correo
								electrónico.
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
									<label htmlFor="code" className="form-label">
										Código de Verificación
									</label>
									<input
										type="text"
										className="form-control text-center fs-4 letter-spacing-3"
										id="code"
										value={code}
										onChange={(e) => setCode(e.target.value.toUpperCase())}
										autoComplete="off"
										maxLength={6}
										required
										style={{ letterSpacing: "0.5rem" }}
									/>
									<small className="form-text text-muted">
										El código expira en 15 minutos
									</small>
								</div>

								<button
									type="submit"
									className="btn btn-primary w-100 mb-3"
									disabled={loading}
								>
									{loading ? "Verificando..." : "Verificar Código"}
								</button>

								<div className="text-center">
									<a href="/forgot-password" className="text-decoration-none">
										Solicitar nuevo código
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
