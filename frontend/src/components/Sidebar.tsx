import { useEVRPStore } from "@/lib/evrp-store"
import { List, MousePointer, Settings, Zap } from "lucide-react"
import { CustomerProperties } from "./property-editors/CustomerProperties"
import { DepotProperties } from "./property-editors/DepotProperties"
import { StationProperties } from "./property-editors/StationProperties"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "./ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { VehicleProperties } from "./VehicleProperties"
import { ElementsList } from "./ElementsList"

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const activeTab = useEVRPStore((s) => s.activeTab)
  const setActiveTab = useEVRPStore((s) => s.setActiveTab)
  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'elements' | 'settings' | 'vehicles')}>
      <Sidebar
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        {...props}
      >
        <SidebarHeader className="border-b border-gray-200">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger value="elements" className="flex-1 gap-2 py-4">
              <List size={3.5} />
              Elements
            </TabsTrigger>

            <TabsTrigger value="settings" className="flex-1 gap-2 py-4">
              <Settings size={3.5} />
              Settings
            </TabsTrigger>

            <TabsTrigger value="vehicles" className="flex-1 gap-2 py-4">
              <Zap size={3.5} />
              Vehicles
            </TabsTrigger>
          </TabsList>
        </SidebarHeader>


        <SidebarContent className="flex-1 mt-0 overflow-hidden">
          <TabsContent value="elements" className="h-full p-4">
            <ElementsList />
          </TabsContent>

          <TabsContent value="settings" className="h-full p-4">
            <SelectionContent />
          </TabsContent>

          <TabsContent value="vehicles" className="h-full p-4">
            <VehicleProperties />
          </TabsContent>
        </SidebarContent>


        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
    </Tabs>
  )
}



function SelectionContent() {
  const { selection } = useEVRPStore()

  if (selection.type === 'depot') return <DepotProperties />
  if (selection.type === 'customer') return <CustomerProperties />
  if (selection.type === 'station') return <StationProperties />

  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
      <MousePointer className="size-8 mb-2 opacity-50" />
      <p className="text-sm">Click on an element to edit</p>
      <p className="text-xs mt-1">or use tools to add new elements</p>
    </div>
  )
}
