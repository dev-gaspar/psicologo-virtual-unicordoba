"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
		idCountry: "",
	});
	const [countries, setCountries] = useState<any[]>([]);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const { executeRecaptcha } = useGoogleReCaptcha();
	const router = useRouter();

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await axios.get("http://localhost:8080/api/countries");
				setCountries(response.data);
			} catch (err) {
				console.error("Error al cargar países:", err);
			}
		};
		fetchCountries();
	}, []);

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

			const recaptchaToken = await executeRecaptcha("register");

			const response = await axios.post(
				"http://localhost:8080/api/auth/register",
				{
					fullName: formData.fullName,
					email: formData.email,
					username: formData.username,
					password: formData.password,
					idCountry: parseInt(formData.idCountry),
					recaptchaToken,
				}
			);

			if (response.data.message === "USRREX") {
				setSuccess("¡Registro exitoso! Redirigiendo al inicio de sesión...");
				setTimeout(() => {
					router.push("/");
				}, 2000);
			} else {
				setError("Error en el registro. Verifique los datos.");
			}
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					"Error al registrarse. Intente nuevamente."
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="row justify-content-center align-items-center min-vh-100 py-5">
				<div className="col-md-6">
					<div className="card shadow">
						<div className="card-body p-5">
							<h2 className="text-center mb-4">Registro de Usuario</h2>

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
									<label htmlFor="fullName" className="form-label">
										Nombre Completo
									</label>
									<input
										type="text"
										className="form-control"
										id="fullName"
										value={formData.fullName}
										onChange={(e) =>
											setFormData({ ...formData, fullName: e.target.value })
										}
										autoComplete="off"
										required
									/>
								</div>

								<div className="mb-3">
									<label htmlFor="email" className="form-label">
										Correo Electrónico
									</label>
									<input
										type="email"
										className="form-control"
										id="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										autoComplete="off"
										required
									/>
								</div>

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
										minLength={8}
										maxLength={15}
									/>
									<small className="form-text text-muted">
										8-15 caracteres, sin espacios, debe incluir al menos un
										número
									</small>
								</div>

								<div className="mb-3">
									<label htmlFor="country" className="form-label">
										País
									</label>
									<select
										className="form-select"
										id="country"
										value={formData.idCountry}
										onChange={(e) =>
											setFormData({ ...formData, idCountry: e.target.value })
										}
										required
									>
										<option value="">Seleccione un país</option>
										{countries.map((country) => (
											<option key={country.idCountry} value={country.idCountry}>
												{country.country}
											</option>
										))}
									</select>
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
										Confirmar Contraseña
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
									{loading ? "Registrando..." : "Registrarse"}
								</button>

								<div className="text-center">
									<span className="text-muted">¿Ya tienes cuenta? </span>
									<a href="/" className="text-decoration-none">
										Iniciar Sesión
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
