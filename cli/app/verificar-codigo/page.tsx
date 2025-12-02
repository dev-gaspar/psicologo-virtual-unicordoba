"use client";

import { useState, useEffect, Suspense } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { showSuccess, showError } from "@/lib/notifications";
import { verifyCodeSchema } from "@/lib/validationSchemas";
import { RecaptchaProvider } from "../providers";

function VerifyCodePageContent() {
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
			<div className="row justify-content-center align-items-center min-vh-100 py-3 py-sm-4 py-md-5">
				<div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
					<div className="card shadow-lg border-0">
						<div className="card-body p-4 p-md-5">
							<div className="text-center mb-4">
								<i
									className="fas fa-shield-check fs-1 mb-3"
									aria-hidden="true"
									style={{ color: "var(--primary-green)" }}
								></i>
								<h1 className="brand-text h3 mb-2">Verificar Código</h1>
								<p className="text-muted mb-0">
									Ingresa el código de 6 caracteres que recibiste en tu correo
								</p>
							</div>

							<form onSubmit={handleSubmit} noValidate>
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

								<div className="d-grid gap-2">
									<button
										type="submit"
										className="btn btn-primary"
										disabled={loading || code.length < 6}
										aria-label={
											loading
												? "Verificando código, por favor espere"
												: "Verificar código de recuperación"
										}
									>
										{loading ? (
											<>
												<span
													className="spinner-border spinner-border-sm me-2"
													role="status"
													aria-hidden="true"
												></span>
												<span>Verificando...</span>
											</>
										) : (
											<>
												<i
													className="fas fa-check-circle me-2"
													aria-hidden="true"
												></i>
												<span>Verificar Código</span>
											</>
										)}
									</button>
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

export default function VerifyCodePage() {
	return (
		<RecaptchaProvider>
			<Suspense fallback={<div>Cargando...</div>}>
				<VerifyCodePageContent />
			</Suspense>
		</RecaptchaProvider>
	);
}
