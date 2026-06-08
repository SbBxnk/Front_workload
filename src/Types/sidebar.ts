export interface SidebarMenuItem {
  id: number
  label: string
  icon: string
  href: string
}

export interface SidebarMenuGroup {
  title: string
  items: SidebarMenuItem[]
}

export interface SidebarPayload {
  menus: SidebarMenuGroup[]
  isAdmin: boolean
}
