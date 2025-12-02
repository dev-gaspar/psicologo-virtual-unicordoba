"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { verifyCodeSchema } from "@/lib/validationSchemas";

export default function VerifyCodePage() {
	const [code, setCode] = useState("");
	const [errors, setErrors] = useState<any>({});
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();
	const searchParams = useSearchParams();
	const requestId = searchParams.get("requestId");

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			router.push("/panel");
			return;
		}

		if (!requestId) {
			showError("ID de solicitud no válido");
		}
	}, [requestId, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validar formulario con yup
		try {
			await verifyCodeSchema.validate({ code }, { abortEarly: false });
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

			const recaptchaToken = await executeRecaptcha("verify_code");

			const response = await apiClient.post("/auth/verify-code", {
				codeReq: requestId,
				codeGen: code,
				recaptchaToken,
			});

			if (response.data.message === "CRQCOR") {
				showSuccess("Código verificado correctamente. Redirigiendo...");
				setTimeout(() => {
					router.replace(`/restablecer-contrasena?requestId=${requestId}`);
				}, 2000);
			}
		} catch (err: any) {
			showError(err.message || "Error al verificar el código");
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
							<div className="text-center mb-4">
								<h2 className="brand-text mb-3">Verificar Código</h2>
								<p className="text-muted">
									Ingresa el código de 6 caracteres que recibiste en tu correo.
								</p>
							</div>

							<form onSubmit={handleSubmit}>
								<div className="single-input has-label">
									<label htmlFor="code">Código de Verificación</label>
									<input
										type="text"
										className={`text-center fs-4 ${
											errors.code ? "is-invalid" : ""
										}`}
										id="code"
										value={code}
										onChange={(e) => setCode(e.target.value.toUpperCase())}
										autoComplete="off"
										maxLength={6}
										placeholder="ABC123"
										style={{ letterSpacing: "0.5rem", paddingLeft: "20px" }}
									/>
									{errors.code && (
										<div className="invalid-feedback text-center">
											{errors.code}
										</div>
									)}
									<small className="form-text text-muted d-block text-center mt-2">
										<i className="fas fa-clock me-1"></i>El código expira en 15
										minutos
									</small>
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
											Verificando...
										</>
									) : (
										<>
											<i className="fas fa-check-circle me-2"></i>Verificar
											Código
										</>
									)}
								</button>
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
