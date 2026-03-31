import MapView from "@/components/MapView";
import AppSidebar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <Toolbar />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 flex overflow-hidden">
              <MapView />
            </div >
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

