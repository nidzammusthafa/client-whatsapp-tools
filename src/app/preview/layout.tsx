"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Users,
  PhoneForwarded,
  MessageCircleCode,
  Megaphone,
  MessagesSquare,
  Database,
  NotebookTabs,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  subMenu?: MenuItem[];
}

const previewItems: MenuItem[] = [
  { title: "Home", url: "/preview", icon: LayoutDashboard },
  { title: "Client Manager", url: "/preview/accounts", icon: Users },
  { title: "Inbox", url: "/preview/inbox", icon: MessagesSquare },
  { title: "WA Blast", url: "/preview/blast", icon: Megaphone },
  { title: "WA Warmer", url: "/preview/warmer", icon: MessageCircleCode },
  { title: "Number Checker", url: "/preview/checker", icon: PhoneForwarded },
  {
    title: "Saved Data",
    icon: Database,
    subMenu: [
      {
        title: "Contacts & Templates",
        url: "/preview/management",
        icon: NotebookTabs,
      },
    ],
  },
];

function PreviewSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="p-2 flex flex-col gap-2">
        {previewItems.map((item, i) => {
          if (item.subMenu) {
            return (
              <Collapsible
                defaultOpen
                className="group/collapsible w-full"
                key={i}
              >
                <SidebarGroup className="p-0">
                  <SidebarGroupLabel asChild className="hover:bg-accent/40">
                    <CollapsibleTrigger className={`${!open && "hidden"}`}>
                      {item.title}
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {item.subMenu.map((sub, j) => (
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

          return (
            <SidebarMenu key={i}>
              <SidebarMenuItem className="flex items-center">
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url || "#"}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          );
        })}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <PreviewSidebar />
      <SidebarTrigger className="fixed z-50 sm:left-14" />
      <div className="flex min-h-screen w-screen max-w-screen overflow-x-hidden content-center">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
