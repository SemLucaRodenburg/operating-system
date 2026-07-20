import {
  LayoutDashboard,
  Target,
  Repeat,
  PenLine,
  LineChart,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNavItems: NavItem[] = [
  { href: "/", label: "Vandaag", icon: LayoutDashboard },
  { href: "/doelen", label: "Doelen", icon: Target },
  { href: "/gewoontes", label: "Gewoontes", icon: Repeat },
  { href: "/check-in", label: "Check-in", icon: PenLine },
  { href: "/inzichten", label: "Inzichten", icon: LineChart },
];

export const secondaryNavItems: NavItem[] = [
  { href: "/ai", label: "AI", icon: Sparkles },
  { href: "/instellingen", label: "Instellingen", icon: Settings },
];

export const allNavItems: NavItem[] = [...primaryNavItems, ...secondaryNavItems];
