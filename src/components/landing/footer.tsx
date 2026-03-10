"use client";

import { motion } from "framer-motion";
import { Github, BookOpen, Globe } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: Github,
  },
  {
    label: "Documentation",
    href: "/docs",
    icon: BookOpen,
  },
  {
    label: "OpenClaw",
    href: "https://openclaw.com",
    icon: Globe,
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[hsl(var(--glass-border)/0.1)]">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gradient">
            SoulHub
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground/60">
            Built with love for the AI community
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} SoulHub. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
