"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (!executeRecaptcha) {
				setError("reCAPTCHA no está disponible");
				setLoading(false);
				return;
			}

			const recaptchaToken = await executeRecaptcha("login");

			const response = await axios.post(
				"http://localhost:8080/api/auth/login",
				{
					username: formData.username,
					password: formData.password,
					recaptchaToken,
				}
			);

			if (response.data.codemsg === "USRCCT") {
				localStorage.setItem("user", JSON.stringify(response.data.datauser));
				router.push("/dashboard");
			} else {
				setError("Usuario o contraseña incorrectos");
			}
		} catch (err) {
			setError("Error al iniciar sesión. Intente nuevamente.");
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
							<h2 className="text-center mb-4">Iniciar Sesión</h2>

							{error && (
								<div className="alert alert-danger" role="alert">
									{error}
								</div>
							)}

							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label htmlFor="username" className="form-label">
										Usuario
									</label>
									<input
										type="text"
										className="form-control"
										id="username"
										value={formData.username}
										onChange={(e) =>
											setFormData({ ...formData, username: e.target.value })
										}
										autoComplete="off"
										required
									/>
								</div>

								<div className="mb-3">
									<label htmlFor="password" className="form-label">
										Contraseña
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
									/>
								</div>

								<button
									type="submit"
									className="btn btn-primary w-100 mb-3"
									disabled={loading}
								>
									{loading ? "Iniciando sesión..." : "Iniciar Sesión"}
								</button>

								<div className="text-center">
									<a href="/forgot-password" className="text-decoration-none">
										¿Olvidaste tu contraseña?
									</a>
								</div>

								<div className="text-center mt-3">
									<span className="text-muted">¿No tienes cuenta? </span>
									<a href="/register" className="text-decoration-none">
										Regístrate
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
