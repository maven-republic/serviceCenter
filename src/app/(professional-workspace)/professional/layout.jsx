// app/(professional-workspace)/professional/workspace/layout.jsx
import MobileNavigation2 from "@/components/header/MobileNavigation2"
import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace"

export const metadata = {
  title: "Professional Workspace",
}

export default function WorkspaceLayout({ children }) {
  return (
    <>
      <MobileNavigation2 />
      <ProfessionalWorkspace>
        {children}
      </ProfessionalWorkspace>
    </>
  )
}

