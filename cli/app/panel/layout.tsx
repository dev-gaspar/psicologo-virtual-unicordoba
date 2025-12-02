"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import { showConfirm, showSuccess } from "@/lib/notifications";
import "./panel.css";

export default function PanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
		return (
			<div className="d-flex justify-content-center align-items-center min-vh-100">
				<div
					className="spinner-border"
					role="status"
					style={{ color: "var(--primary-green)" }}
				>
					<span className="visually-hidden">Cargando...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="panel-container">
			<Sidebar username={user.username} onLogout={handleLogout} />
			<main className="panel-content" role="main" id="main-content">
				{children}
			</main>
		</div>
	);
}
