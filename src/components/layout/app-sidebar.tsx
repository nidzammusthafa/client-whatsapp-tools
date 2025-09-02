"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { showNotification } from "@/lib/notificationUtils";
import { getWhatsappSocket } from "@/lib/whatsappSocket";
import { ConversationMessage } from "@/types";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Calendar,
  PlugZap,
  Settings,
  Archive,
  Home,
  Users,
  PhoneForwarded,
  MessageCircleCode,
  Megaphone,
  MessagesSquare,
  Database,
  NotebookTabs,
  ChevronDown,
  Menu,
} from "lucide-react";

import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";
import RefreshSocket from "./RefreshSocket";
import { Separator } from "../ui/separator";
import { useWhatsAppManager } from "@/hooks/useWhatsappManager";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  subMenu?: MenuItem[];
  submenu?: MenuItem[];
}

const items: MenuItem[] = [
  {
    title: "Home",
    url: "/dashboard/",
    icon: Home,
  },
  {
    title: "Tools",
    icon: Menu,
    subMenu: [
      {
        title: "Client Manager",
        url: "/dashboard/client",
        icon: Users,
      },
      {
        title: "NumberCheck",
        url: "/dashboard/number-check",
        icon: PhoneForwarded,
      },
      {
        title: "WhatsApp Warmer",
        url: "/dashboard/whatsapp-warmer",
        icon: MessageCircleCode,
      },
      {
        title: "WhatsApp Blast",
        url: "/dashboard/whatsapp-blast",
        icon: Megaphone,
      },
      {
        title: "WhatsApp Messages",
        url: "/dashboard/whatsapp-messages",
        icon: MessagesSquare,
      },
    ],
  },
  {
    title: "Saved Data",
    icon: Database,
    subMenu: [
      {
        title: "Address",
        url: "/dashboard/data/address",
        icon: NotebookTabs,
      },
      {
        title: "Messages Template",
        url: "/dashboard/data/message-templates",
        icon: Archive,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    submenu: [
      {
        title: "Socket",
        url: "/dashboard/settings/socket",
        icon: PlugZap,
      },
      {
        title: "Calendar",
        url: "#",
        icon: Calendar,
      },
    ],
  },
];

export function AppSidebar() {
  useWhatsAppManager();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  React.useEffect(() => {
    const socket = getWhatsappSocket();

    const onNewMessage = (payload: { message: ConversationMessage }) => {
      if (typeof window !== "undefined" && !payload.message.isFromMe) {
        showNotification(
          `Pesan baru dari ${payload.message.sender.split("@")[0]}`,
          payload.message.body
        );

        toast.success(
          <div>
            <p className="text-sm font-semibold mb-2">Pesan Baru</p>
            <div className="flex gap-2">
              <p className="text-sm text-muted-foreground">
                {payload.message.sender.split("@")[0]}:
              </p>
              <p className="text-sm text-muted-foreground">
                {payload.message.body}
              </p>
            </div>
          </div>,
          {
            position: "top-right",
            duration: 5000,
          }
        );
      }
    };

    socket.on("whatsapp-new-message", onNewMessage);

    return () => {
      socket.off("whatsapp-new-message", onNewMessage);
    };
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="p-2 flex flex-col gap-2">
        {items.map((item, i) => {
          const subItems = item.subMenu || item.submenu;

          if (subItems) {
            return (
              <Collapsible
                defaultOpen
                className="group/collapsible w-full"
                key={i}
              >
                <SidebarGroup className="p-0">
                  <SidebarGroupLabel
                    asChild
                    className="hover:bg-accent/40"
                    onClick={() => setOpenMobile(false)}
                  >
                    <CollapsibleTrigger>
                      {item.title}
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {subItems.map((sub, j) => (
                          <SidebarMenuItem
                            key={j}
                            className="flex items-center"
                          >
                            <Tooltip>
                              <TooltipTrigger className="w-full">
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === sub.url}
                                >
                                  <Link href={sub.url || "#"}>
                                    <sub.icon className="h-4 w-4" />
                                    <span>{sub.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{sub.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          }

          // ✅ Kalau single item
          return (
            <SidebarMenu key={i}>
              <SidebarMenuItem className="flex items-center">
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url || "#"}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          );
        })}
      </SidebarContent>

      <Separator />
      <SidebarFooter>
        <div className="flex w-full items-center gap-2">
          <ThemeToggle />
          <RefreshSocket />
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
