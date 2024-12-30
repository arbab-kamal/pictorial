import * as React from "react"
import {
  CreditCard,
  Frame,
  Image,
  Images,
  Layers,
  Settings2,
  Sparkles,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UpgradeBtn from "./billing/UpgradeBtn"
import { getSubscription } from "@/lib/supabase/queries"

const navMain =  [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Generate Images",
      url: "/image-generation",
      icon: Image,
    },
    {
      title: "My Models",
      url: "/models",
      icon: Frame,
    },
    {
      title: "Train Model",
      url: "/model-training",
      icon: Layers,
    },
    {
      title: "My Images",
      url: "/gallery",
      icon: Images,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/account-settings",
      icon: Settings2,
    },
  ]

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient()
  const { data:userData, error } = await supabase.auth.getUser()
  if (error || !userData?.user) {
    redirect('/login')
  }
  const user = {
    name: userData.user.user_metadata.full_name,
    email: userData.user.email ?? "",
  }

  const subscription = await getSubscription(supabase);
  const currentPlanName = subscription?.prices.products.name || "Free";
  

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Pictoria AI
                </span>
                <span className="truncate text-xs">{currentPlanName}</span>
              </div>
            </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {subscription?.status !== 'active' && <UpgradeBtn />}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
