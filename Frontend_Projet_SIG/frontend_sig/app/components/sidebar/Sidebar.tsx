"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import "./Sidebar.scss";
import Link from "next/link";

interface SidebarProps {
  role: string | null; // Déclare le rôle comme une chaîne
}
interface MenuItem {
  id: string;
  icon: string;
  label: string | null;
  children: Array<MenuItem> | null;
  url: string;
}

const Sidebar = () => {
  const router = useRouter();
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleBtnRef = useRef<HTMLAnchorElement | null>(null);
  const [menuItems, setMenuItems] = useState<Array<MenuItem> | undefined>([]);
  const [role, setRole] = useState<string>("");
  useEffect(() => {
    const storedRole = localStorage.getItem("roles");
    console.log("Stored role from localStorage:", storedRole);
    if (storedRole) {
      setRole(JSON.parse(storedRole));
    } else {
      setRole("ADMINISTRATEUR");
    }
  }, []); // Supprimer `role` des dépendances pour éviter des boucles infinies.

  useEffect(() => {
    if (!role) return; // Empêche la logique si `role` est vide.

    console.log("Role updated:", role);

    const getMenuItems = (): Array<MenuItem> => {
      switch (role) {
        case "ADMINISTRATEUR":
          return [
            {
              id: "Menu",
              icon: "keyboard_double_arrow_left",
              label: null,
              children: null,
              url: "#",
            },
            {
              id: "Dashboard",
              icon: "dashboard",
              label: "Dashboard",
              children: null,
              url: "/Interfaces/dashboard",
            },
            {
              id: "users",
              icon: "group",
              label: "Users",
              children: [
                {
                  id: "CreateUsers",
                  icon: "person_add",
                  label: "Create Users",
                  children: null,
                  url: "/Interfaces/create-user",
                },
                {
                  id: "user-list",
                  icon: "people",
                  label: "Registered people",
                  children: null,
                  url: "/Interfaces/user-list",
                },
              ],
              url: "#",
            },
            {
              id: "voting-centers",
              icon: "apartment",
              label: "Voting centers",
              children: [
                {
                  id: "center-list",
                  icon: "list",
                  label: "Voting centers list",
                  children: null,
                  url: "/Interfaces/center-list",
                },
                {
                  id: "add-voting-centers",
                  icon: "add",
                  label: "New voting center",
                  children: null,
                  url: "/Interfaces/add-center",
                },
              ],
              url: "#",
            },
            {
              id: "Voting-office",
              icon: "how_to_vote",
              label: "Voting office",
              children: [
                {
                  id: "voting-office-list",
                  icon: "list",
                  label: "Voting office list",
                  children: null,
                  url: "/Interfaces/voting-office-list",
                },
                {
                  id: "add-voting-office",
                  icon: "add",
                  label: "Voting office",
                  children: null,
                  url: "/Interfaces/create-voting-office",
                },
              ],
              url: "#",
            },
            {
              id: "voting-results",
              icon: "summarize",
              label: "Voting result",
              children: [
                {
                  id: "consult-voting-result",
                  icon: "visibility",
                  label: "Consult results",
                  children: null,
                  url: "/Interfaces/voting-results",
                },
                {
                  id: "insert-result",
                  icon: "edit",
                  label: "Insert a vote result",
                  children: null,
                  url: "/Interfaces/new-result",
                },
              ],
              url: "#",
            },
            {
              id: "Settings",
              icon: "settings",
              label: "Settings",
              children: null,
              url: "#",
            },
            {
              id: "Logout",
              icon: "logout",
              label: "Log Out",
              children: null,
              url: "#",
            },
          ];
        case "ENROLEUR":
          return [
            {
              id: "Menu",
              icon: "keyboard_double_arrow_left",
              label: null,
              children: null,
              url: "#",
            },
            {
              id: "Dashboard",
              icon: "dashboard",
              label: "Dashboard",
              children: null,
              url: "/Interfaces/dashboard",
            },
            {
              id: "users",
              icon: "group",
              label: "Enrolled electors",
              children: [
                {
                  id: "CreateUsers",
                  icon: "person_add",
                  label: "Add electors",
                  children: null,
                  url: "/Interfaces/create-user",
                },
                {
                  id: "user-list",
                  icon: "people",
                  label: "Registered electors",
                  children: null,
                  url: "/Interfaces/user-list",
                },
              ],
              url: "#",
            },
            {
              id: "Settings",
              icon: "settings",
              label: "Settings",
              children: null,
              url: "#",
            },
            {
              id: "Logout",
              icon: "logout",
              label: "Log Out",
              children: null,
              url: "#",
            },
          ];
        case "SCRUTATEUR":
          return [
            {
              id: "Menu",
              icon: "keyboard_double_arrow_left",
              label: null,
              children: null,
              url: "#",
            },
            {
              id: "Dashboard",
              icon: "dashboard",
              label: "Dashboard",
              children: null,
              url: "/Interfaces/dashboard",
            },
            {
              id: "voting-results",
              icon: "summarize",
              label: "Voting result",
              children: [
                {
                  id: "consult-voting-result",
                  icon: "visibility",
                  label: "Consult office results",
                  children: null,
                  url: "/Interfaces/voting-results",
                },
                {
                  id: "insert-result",
                  icon: "edit",
                  label: "Edit office result",
                  children: null,
                  url: "/Interfaces/new-result",
                },
              ],
              url: "#",
            },
            {
              id: "Settings",
              icon: "settings",
              label: "Settings",
              children: null,
              url: "#",
            },
            {
              id: "Logout",
              icon: "logout",
              label: "Log Out",
              children: null,
              url: "#",
            },
          ];
        case "SUPERVISEUR":
          return [
            {
              id: "Menu",
              icon: "keyboard_double_arrow_left",
              label: null,
              children: null,
              url: "#",
            },
            {
              id: "Dashboard",
              icon: "dashboard",
              label: "Dashboard",
              children: null,
              url: "/Interfaces/dashboard",
            },
            {
              id: "users",
              icon: "group",
              label: "Users",
              children: [
                {
                  id: "CreateUsers",
                  icon: "person_add",
                  label: "Create Users",
                  children: null,
                  url: "/Interfaces/create-user",
                },
                {
                  id: "user-list",
                  icon: "people",
                  label: "Registered people",
                  children: null,
                  url: "/Interfaces/user-list",
                },
              ],
              url: "#",
            },
            {
              id: "Settings",
              icon: "settings",
              label: "Settings",
              children: null,
              url: "#",
            },
            {
              id: "Logout",
              icon: "logout",
              label: "Log Out",
              children: null,
              url: "#",
            },
          ];
        default:
          console.log("Role is :", role);
          return [];
      }
    };

    const items = getMenuItems();
    console.log("Generated menu items:", items);
    setMenuItems(items);
  }, [role]); // Dépend uniquement de `role`.
  const toggleSidebar = (event: React.MouseEvent) => {
    if (sidebarRef.current) {
      sidebarRef.current.classList.toggle("close");
      toggleBtnRef.current?.classList.toggle("rotate");
    }
    closeAllSubMenus();
  };
  const closeAllSubMenus = () => {
    const showElements = Array.from(
      sidebarRef.current?.getElementsByClassName("show") || []
    );
    showElements.forEach((ul) => {
      ul.classList.remove("show");
      ul.previousElementSibling?.classList.remove("rotate");
    });
  };
  function toggleSubMenu(button: any): void {
    //closeAllSubMenus()
    if (!button.nextElementSibling.classList.contains("show")) {
      closeAllSubMenus();
    }
    button.nextElementSibling?.classList.toggle("show");
    button.classList.toggle("rotate");

    if (sidebarRef.current?.classList.contains("close")) {
      sidebarRef.current.classList.toggle("close");
      toggleBtnRef.current?.classList.toggle("rotate");
    }
  }
  const handleLogout = () => {
    try {
      // Supprime les données utilisateur du localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("roles");
      localStorage.removeItem("user");

      // Affiche un message de confirmation
      alert("User logged out successfully");

      // Redirige vers la page de connexion
      router.replace("/Login"); // Remplacez "/login" par le chemin de votre page de connexion
    } catch (error) {
      console.error("Error during logout", error);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <aside ref={sidebarRef}>
      <ul>
        {menuItems?.map((item) => (
          <li key={item.id} className="active">
            {item.children ? (
              <>
                <button
                  onClick={(e) =>
                    toggleSubMenu(e.currentTarget as HTMLButtonElement)
                  }
                  className="dropdown-btn"
                >
                  <i className="material-icons">{item.icon}</i>
                  <span>{item.label}</span>
                  <i className="material-icons">arrow_drop_down</i>
                </button>
                <ul className="sub-menu">
                  <div>
                    {item.children.map((child) => (
                      <li key={child.id} className="active">
                        <Link href={child.url}>
                          <i className="material-icons">{child.icon}</i>
                          <span>{child.label}</span>
                        </Link>
                      </li>
                    ))}
                  </div>
                </ul>
              </>
            ) : item.id === "Menu" ? (
              <a
                href={item.url}
                id={item.id}
                ref={toggleBtnRef}
                onClick={(e) => toggleSidebar(e)}
              >
                <i className="material-icons">{item.icon}</i>
              </a>
            ) : item.id === "Logout" ? (
              // Vérifie si c'est l'item "Logout" et appelle la fonction handleLogout
              <a
                href="#"
                id={item.id}
                onClick={(e) => {
                  e.preventDefault(); // Empêche le comportement par défaut du lien
                  handleLogout(); // Appelle la fonction de logout
                }}
              >
                <i className="material-icons">{item.icon}</i>
                <span>{item.label}</span>
              </a>
            ) : (
              <Link href={item.url} id={item.id}>
                <i className="material-icons">{item.icon}</i>
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
