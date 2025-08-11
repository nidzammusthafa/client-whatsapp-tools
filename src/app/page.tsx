import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sheet,
  Table,
  FileJson,
  MapPin,
  MessageSquare,
  MousePointerClick,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Table className="h-8 w-8 text-primary" />,
    title: "Excel Tools",
    description:
      "Edit, format, filter, dan analisis data Excel Anda secara efisien dengan berbagai alat canggih.",
    href: "/excel",
  },
  {
    icon: <MousePointerClick className="h-8 w-8 text-primary" />, // FIX: Used the corrected icon
    title: "Scraper",
    description:
      "Ekstrak data dari halaman web dengan mudah untuk kebutuhan analisis atau pengarsipan Anda.",
    href: "/scrape",
  },
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: "Coordinates Generator",
    description:
      "Buat dan kelola data geografis, serta lakukan konversi antar format koordinat dengan cepat.",
    href: "/coordinates-generator",
  },
  {
    icon: <FileJson className="h-8 w-8 text-primary" />,
    title: "JSON Tools",
    description:
      "Alat untuk memvalidasi, memformat, dan mengubah data JSON sesuai kebutuhan proyek Anda.",
    href: "/json",
  },
  {
    icon: <Sheet className="h-8 w-8 text-primary" />,
    title: "ODP Tools",
    description:
      "Alat khusus untuk bekerja dengan data ODP, termasuk perhitungan dan analisis jarak.",
    href: "/odp-tools",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "WhatsApp Tools",
    description:
      "Manfaatkan berbagai utilitas untuk mengelola atau berinteraksi dengan data WhatsApp.",
    href: "/whatsapp",
  },
];

// --- Sub-component for a single Feature Card ---
const FeatureCard = ({
  icon,
  title,
  description,
  href,
}: (typeof features)[0]) => (
  <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
    <CardHeader className="flex flex-row items-center gap-4 pb-4">
      {icon}
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow" />
    <CardFooter>
      <Button asChild className="w-full">
        <Link href={href}>
          Buka Fitur <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

// --- Main Homepage Component ---
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          ToolSuite Project
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
          Kumpulan alat bantu produktivitas modern untuk menyederhanakan alur
          kerja Anda. Dari editor data hingga utilitas web, semua yang Anda
          butuhkan ada di sini.
        </p>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.href} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
