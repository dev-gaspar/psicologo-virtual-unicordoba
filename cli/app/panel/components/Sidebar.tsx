"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
	username: string;
	onLogout: () => void;
}

export default function Sidebar({ username, onLogout }: SidebarProps) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const menuItems = [
		{
			name: "Inicio",
			icon: "fa-home",
			href: "/panel",
			ariaLabel: "Ir a Inicio",
		},
		{
			name: "Asistente Virtual",
			icon: "fa-comments",
			href: "/panel/chat",
			ariaLabel: "Ir a Asistente Virtual",
		},
	];

	return (
		<>
			{/* Overlay para cerrar el sidebar en móvil */}
			{isOpen && (
				<div
					className="sidebar-overlay"
					onClick={toggleSidebar}
					role="presentation"
					aria-hidden="true"
				/>
			)}

			{/* Botón de toggle para móvil */}
			<button
				className="sidebar-toggle"
				onClick={toggleSidebar}
				aria-label={
					isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
				}
				aria-expanded={isOpen}
				aria-controls="main-sidebar"
				type="button"
			>
				<i
					className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}
					aria-hidden="true"
				/>
			</button>

			{/* Sidebar */}
			<aside
				id="main-sidebar"
				className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
				role="navigation"
				aria-label="Navegación principal"
			>
				{/* Header del sidebar */}
				<div className="sidebar-header">
					<div className="sidebar-brand">
						<i className="fas fa-brain" aria-hidden="true" />
						<span className="sidebar-brand-text">Psicólogo Virtual</span>
					</div>
				</div>

				{/* Usuario info */}
				<div
					className="sidebar-user"
					role="contentinfo"
					aria-label="Información del usuario"
				>
					<div className="sidebar-user-avatar" aria-hidden="true">
						<i className="fas fa-user-circle" />
					</div>
					<div className="sidebar-user-info">
						<p className="sidebar-user-name" id="sidebar-username">
							{username}
						</p>
					</div>
				</div>

				{/* Navigation menu */}
				<nav className="sidebar-nav" aria-label="Menú de navegación">
					<ul className="sidebar-menu" role="menubar">
						{menuItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<li key={item.href} role="none">
									<Link
										href={item.href}
										className={`sidebar-menu-item ${isActive ? "active" : ""}`}
										aria-label={item.ariaLabel}
										aria-current={isActive ? "page" : undefined}
										role="menuitem"
										onClick={() => setIsOpen(false)}
									>
										<i className={`fas ${item.icon}`} aria-hidden="true" />
										<span>{item.name}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* Logout button */}
				<div className="sidebar-footer">
					<button
						className="sidebar-logout-btn"
						onClick={onLogout}
						aria-label="Cerrar sesión"
						type="button"
					>
						<i className="fas fa-sign-out-alt" aria-hidden="true" />
						<span>Cerrar Sesión</span>
					</button>
				</div>
			</aside>
		</>
	);
}
