"use client";
import navigation from "@/data/navigation";
import { isActiveNavigation } from "@/utils/isActiveNavigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const path = usePathname();

  return (
    <ul
      className={`ace-responsive-menu ui-navigation flex items-center gap-6 ${
        ["/home-3", "/home-4", "/home-10"].includes(path) ? "menu-without-paddingy" : ""
      }`}
    >
      {navigation.map((item, i) => (
        <li
          key={i}
          className={`visible_list menu-active ${item.id === 1 ? "home-menu-parent" : ""}`}
        >
          {item.children ? (
            <button
              className={`list-item text-sm font-medium transition-colors hover:text-primary ${
                isActiveNavigation(path, item) ? "ui-active text-primary" : "text-gray-700"
              }`}
            >
              <span className="title">{item.name}</span>{" "}
              {item.children && <span className="arrow" />}
            </button>
          ) : (
            <Link
              href={item.path}
              className={`list-item text-sm font-medium transition-colors hover:text-primary ${
                item.path === path ? "ui-active text-primary" : "text-gray-700"
              }`}
            >
              <span className="title">{item.name}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
