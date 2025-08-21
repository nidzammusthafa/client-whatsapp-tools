"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, Menu } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import {
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import LogoutButton from "./LogoutButton";
import RefreshSocket from "./RefreshSocket";

// Data untuk navigasi yang lebih deskriptif
const components: { title: string; href: string; description: string }[] = [
  {
    title: "Excel Tools",
    href: "/excel",
    description: "Edit, format, filter, dan analisis data Excel Anda.",
  },
  {
    title: "JSON Tools",
    href: "/json",
    description: "Validasi, format, dan konversi data JSON dengan mudah.",
  },
  {
    title: "ODP Tools",
    href: "/odp-tools",
    description: "Alat khusus untuk bekerja dengan data ODP KML.",
  },
  {
    title: "Scraper",
    href: "/scrape",
    description: "Ekstrak data dari halaman web untuk kebutuhan analisis.",
  },
  {
    title: "Coordinates",
    href: "/coordinates-generator",
    description: "Buat grid dan ekstrak koordinat dari URL Google Maps.",
  },
  {
    title: "WhatsApp",
    href: "/whatsapp",
    description: "Utilitas untuk mengelola dan berinteraksi dengan WhatsApp.",
  },
];

// Komponen ListItem untuk digunakan di dalam NavigationMenuContent
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

/**
 * Renders the navigation menu for desktop devices.
 */
const DesktopNav = () => (
  <div className="hidden md:flex">
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Fitur Utama</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/docs" className={navigationMenuTriggerStyle()}>
              Dokumentasi
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
);

/**
 * Renders the navigation menu for mobile devices using a Sheet component.
 */
const MobileNav = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Buka Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[360px]">
          <SheetHeader>
            <SheetTitle>
              <div className="flex items-center">
                <LayoutGrid className="mr-2 h-5 w-5" />
                <span>Menu Navigasi</span>
              </div>
            </SheetTitle>
            <SheetDescription>
              Pilih fitur yang ingin Anda gunakan dari daftar berikut.
            </SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-2 pt-6">
            {components.map((component) => (
              <Link
                key={`mobile-${component.href}`}
                href={component.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "relative overflow-hidden rounded-none p-3 text-center font-medium text-foreground transition-colors duration-200 hover:bg-accent/25",
                  "after:absolute after:bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100"
                )}
              >
                {component.title}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between">
        <div className="flex flex-row gap-2">
          <Link href="/" className="mr-auto flex items-center space-x-2">
            <LayoutGrid className="ml-8 h-6 w-6" />
          </Link>
          <DesktopNav />
        </div>

        <div className="flex items-center space-x-4">
          <LogoutButton />
          <ThemeToggle />
          <RefreshSocket />
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
