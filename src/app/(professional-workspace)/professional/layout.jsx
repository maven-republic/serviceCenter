// app/(professional-workspace)/professional/workspace/layout.jsx
import MobileNavigation2 from "@/components/header/MobileNavigation2"
import DashboardLayout from "@/components/professional-workspace/DashboardLayout"

export const metadata = {
  title: "Professional Workspace",
}

export default function WorkspaceLayout({ children }) {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  )
}
