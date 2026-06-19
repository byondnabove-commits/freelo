import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  Users,
  FileText,
  FileSignature,
  FileSpreadsheet,
  Settings,
  User2,
  LucideIcon
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationStructure: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Projects", path: "/dashboard/projects", icon: FolderKanban },
      { label: "CRM", path: "/dashboard/crm", icon: Users2 },
      { label: "Kanban", path: "/dashboard/kanban", icon: Users },
      { label: "Proposals", path: "/dashboard/proposals", icon: FileText },
      { label: "Contracts", path: "/dashboard/contracts", icon: FileSignature },
      { label: "Forms", path: "/dashboard/forms", icon: FileSpreadsheet },
    ]
  },
  {
    title: "Preferences",
    items: [
      { label: "Settings", path: "/dashboard/settings", icon: Settings },
      { label: "Profile", path: "/dashboard/profile", icon: User2 },
    ]
  }
];