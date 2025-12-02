"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showConfirm, showSuccess } from "@/lib/notifications";

export default function DashboardPage() {
	const [user, setUser] = useState<any>(null);
	const router = useRouter();

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (!userData) {
			router.push("/");
		} else {
			setUser(JSON.parse(userData));
		}
	}, [router]);

	const handleLogout = async () => {
		const result = await showConfirm(
			"¿Estás seguro de que deseas cerrar sesión?",
			"Cerrar Sesión"
		);

		if (result.isConfirmed) {
			localStorage.removeItem("user");
			showSuccess("Sesión cerrada correctamente");
			setTimeout(() => router.push("/"), 1000);
		}
	};

	if (!user) {
		return null;
	}

	return (
		<div className="container-fluid">
			<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
				<div className="container-fluid">
					<a className="navbar-brand" href="/panel">
						UTEQ Platform
					</a>
					<div className="d-flex">
						<span className="navbar-text me-3">
							Bienvenido, {user.username}
						</span>
						<button
							className="btn btn-outline-light btn-sm"
							onClick={handleLogout}
						>
							Cerrar Sesión
						</button>
					</div>
				</div>
			</nav>

			<div className="container mt-5">
				<div className="row">
					<div className="col-12">
						<h1>Dashboard</h1>
						<div className="card mt-4">
							<div className="card-body">
								<h5 className="card-title">Información del Usuario</h5>
								<p className="card-text">
									<strong>Usuario:</strong> {user.username}
								</p>
								<p className="card-text">
									<strong>Email:</strong> {user.email}
								</p>
								<p className="card-text">
									<strong>ID de Sesión:</strong> {user.id_session}
								</p>
								<p className="card-text">
									<strong>Fecha de inicio de sesión:</strong>{" "}
									{user.datetime_ses}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
