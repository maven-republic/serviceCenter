"use client"
import { logout } from "@/app/(auth)/logout/actions"
import { professionalNavigation } from "@/data/dashboard"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardSidebar() {
  const path = usePathname()

  return (
    <div className="dashboard__sidebar d-none d-lg-block fixed left-0 top-0 h-screen w-[300px] bg-card border-r border-border overflow-y-auto">
      <div className="dashboard_sidebar_list p-4">
        <p className="fz15 fw400 ff-heading pl30 text-muted-foreground mb-4">Workspace</p>
        
        {/* Navigation items with better spacing */}
        <div className="space-y-1">
          {professionalNavigation.slice(0, 8).map((item, i) => (
            <div key={i} className="sidebar_list_item">
              <Link
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  path === item.path 
                    ? "bg-primary text-primary-foreground -is-active" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <i className={`${item.icon} mr-3 w-4 h-4`} />
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4"></div>
        
        <div className="space-y-1">
          {professionalNavigation.slice(8, 14).map((item, i) => (
            <div key={i} className="sidebar_list_item">
              <Link
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  path === item.path 
                    ? "bg-primary text-primary-foreground -is-active" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <i className={`${item.icon} mr-3 w-4 h-4`} />
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="border-t border-border my-4"></div>

        <div className="space-y-1">
          {professionalNavigation.slice(14, 15).map((item, i) => (
            <div key={i} className="sidebar_list_item">
              <Link
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  path === item.path 
                    ? "bg-primary text-primary-foreground -is-active" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <i className={`${item.icon} mr-3 w-4 h-4`} />
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="border-t border-border my-4"></div>

        <div className="space-y-1">
          {professionalNavigation.slice(15, 17).map((item, i) => (
            <div key={i} className="sidebar_list_item">
              {item.name === "Logout" ? (
                <form>
                  <button
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full text-left ${
                      path === item.path 
                        ? "bg-primary text-primary-foreground -is-active" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    formAction={logout}
                  >
                    <i className={`${item.icon} mr-3 w-4 h-4`} />
                    {item.name}
                  </button>
                </form>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    path === item.path 
                      ? "bg-primary text-primary-foreground -is-active" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <i className={`${item.icon} mr-3 w-4 h-4`} />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}