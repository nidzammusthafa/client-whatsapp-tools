"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ShieldCheck,
  Users,
  Target,
  Rocket,
  BarChart,
  Bot,
  MessageSquare,
  Database,
  FileText,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Manajemen Multi-Akun",
    description:
      "Hubungkan dan kelola beberapa nomor WhatsApp dari satu dasbor terpusat.",
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: "WhatsApp Blast Cerdas",
    description:
      "Kirim pesan massal dengan jeda humanis, pesan acak, dan variabel dinamis.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Pemanasan Akun (Warmer)",
    description:
      "Jaga kesehatan akun dan hindari blokir dengan simulasi percakapan otomatis.",
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Pemeriksa Nomor",
    description:
      "Validasi ribuan nomor untuk memastikan hanya nomor aktif yang Anda targetkan.",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Dasbor Pesan Terpusat",
    description:
      "Balas semua pesan dari berbagai akun dalam satu inbox, lengkap dengan notifikasi.",
  },
  {
    icon: <Database className="h-8 w-8 text-primary" />,
    title: "Manajemen Kontak & Template",
    description:
      "Impor kontak dari Excel, simpan ke database, dan kelola template pesan dengan mudah.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "A/B Testing Template",
    description:
      "Lacak performa template pesan berdasarkan poin untuk menemukan kalimat paling efektif.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Ekspor Laporan Excel",
    description:
      "Ekspor semua hasil pekerjaan Anda ke dalam format .xlsx untuk analisis lebih lanjut.",
  },
];

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

const HoverFeaturesSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature
          key={feature.title}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          index={index}
        />
      ))}
    </div>
  );
};

const advantages = [
  {
    icon: Bot,
    title: "Solusi All-in-One",
    description:
      "Bukan hanya blaster, tapi suite lengkap dengan Warmer, Checker, dan Inbox terpusat.",
  },
  {
    icon: ShieldCheck,
    title: "Fokus Pada Keamanan",
    description:
      "Fitur WA Warmer dirancang untuk penggunaan bisnis jangka panjang yang aman.",
  },
  {
    icon: Settings,
    title: "Teknologi Modern",
    description:
      "Dibangun dengan Next.js & TypeScript untuk performa cepat dan skalabilitas tinggi.",
  },
];

import { motion } from "framer-motion";

const FadeInStagger = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ staggerChildren: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

const FadeIn = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.8 }}
    {...props}
  >
    {children}
  </motion.div>
);

export default function CompanyProfilePage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 bg-muted/40">
        <FadeInStagger className="flex flex-col items-center">
          <FadeIn>
            <h1 className="text-5xl font-bold tracking-tight">
              Platform Pemasaran & Komunikasi WhatsApp All-in-One
            </h1>
          </FadeIn>
          <FadeIn>
            <p className="mt-6 text-lg max-w-3xl mx-auto text-muted-foreground">
              Solusi canggih untuk bisnis, agensi digital, dan tim marketing
              untuk memaksimalkan jangkauan, meningkatkan penjualan, dan
              mengelola interaksi pelanggan secara efisien, aman, dan terukur.
            </p>
          </FadeIn>
          <FadeIn>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/preview/accounts">
                <Button size="sm" className="text-md">
                  Lihat Demo Fitur
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="text-md">
                Hubungi Kami
              </Button>
            </div>
          </FadeIn>
        </FadeInStagger>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <FadeInStagger className="text-center mb-12">
            <FadeIn>
              <h2 className="text-4xl font-bold">Fitur-Fitur Unggulan</h2>
            </FadeIn>
            <FadeIn>
              <p className="mt-4 text-lg text-muted-foreground">
                Semua yang Anda butuhkan untuk mendominasi pemasaran WhatsApp.
              </p>
            </FadeIn>
          </FadeInStagger>
          <HoverFeaturesSection />
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 px-4 bg-muted/40">
        <div className="container mx-auto">
          <FadeInStagger className="text-center mb-12">
            <FadeIn>
              <h2 className="text-4xl font-bold">
                Mengapa Memilih Platform Kami?
              </h2>
            </FadeIn>
            <FadeIn>
              <p className="mt-4 text-lg text-muted-foreground">
                Kami tidak hanya membuat alat, kami membangun solusi bisnis yang
                berkelanjutan.
              </p>
            </FadeIn>
          </FadeInStagger>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {advantages.map((advantage, index) => (
              <FadeIn key={index}>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <advantage.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">
                    {advantage.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {advantage.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Target Market Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <FadeInStagger>
            <FadeIn>
              <h2 className="text-4xl font-bold">Ideal Untuk Siapa Saja?</h2>
            </FadeIn>
            <FadeIn>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-lg">
                <div className="p-4">
                  <Users className="mx-auto h-10 w-10 mb-2 text-primary" />
                  Agensi Digital
                </div>
                <div className="p-4">
                  <Target className="mx-auto h-10 w-10 mb-2 text-primary" />
                  Tim Marketing
                </div>
                <div className="p-4">
                  <Rocket className="mx-auto h-10 w-10 mb-2 text-primary" />
                  UKM & Startup
                </div>
                <div className="p-4">
                  <Bot className="mx-auto h-10 w-10 mb-2 text-primary" />
                  Developer SaaS
                </div>
              </div>
            </FadeIn>
          </FadeInStagger>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto py-8 px-4 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Platform Pemasaran WhatsApp. All
            Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
