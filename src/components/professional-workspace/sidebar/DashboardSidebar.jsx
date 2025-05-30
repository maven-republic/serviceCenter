"use client"
import { logout } from "@/app/(auth)/logout/actions"
import { professionalNavigation } from "@/data/dashboard"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardSidebar() {
  const path = usePathname()

  return (
    <>
      <div className="dashboard__sidebar d-none d-lg-block">
        <div className="dashboard_sidebar_list">
          <p className="fz15 fw400 ff-heading pl30">Start</p>
          {professionalNavigation.slice(0, 8).map((item, i) => (
            <div key={i} className="sidebar_list_item mb-1">
              <Link
                href={item.path}
                className={`items-center ${
                  path === item.path ? "-is-active" : ""
                }`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          ))}

          <p className="fz15 fw400 ff-heading pl30 mt30">Organize and Manage</p>
          {professionalNavigation.slice(8, 14).map((item, i) => (
            <div key={i} className="sidebar_list_item mb-1">
              <Link
                href={item.path}
                className={`items-center ${
                  path === item.path ? "-is-active" : ""
                }`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          ))}

          <p className="fz15 fw400 ff-heading pl30 mt30">Schedule</p>
          {professionalNavigation.slice(14, 15).map((item, i) => (
            <div key={i} className="sidebar_list_item mb-1">
              <Link
                href={item.path}
                className={`items-center ${
                  path === item.path ? "-is-active" : ""
                }`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          ))}

          <p className="fz15 fw400 ff-heading pl30 mt30">Account</p>
          {professionalNavigation.slice(15, 17).map((item, i) => (
            <div key={i} className="sidebar_list_item mb-1">
              {item.name === "Logout" ? (
                <form className="sidebar_list_item mb-1">
                  <button
                    className={`items-center ${
                      path === item.path ? "-is-active" : ""
                    }`}
                    formAction={logout}
                  >
                    <i className={`${item.icon} mr15`} />
                    {item.name}
                  </button>
                </form>
              ) : (
                <Link
                  href={item.path}
                  className={`items-center ${
                    path === item.path ? "-is-active" : ""
                  }`}
                >
                  <i className={`${item.icon} mr15`} />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
