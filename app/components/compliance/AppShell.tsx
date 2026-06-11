import { Link, useLocation, Form } from "react-router";
import { cn } from "~/lib/utils";
import { useAuth } from "~/modules/authentication";
import { useConfigurables } from "~/modules/configurables";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield,
  Bell,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles?: string[];
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { config } = useConfigurables();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const appName = config?.appName ?? "ComplianceIQ";
  const companyName = config?.companyName ?? "Allied Financial Insurance";

  const complianceRole = (user?.profile as any)?.complianceRole ?? (isAdmin ? "hr_admin" : "employee");

  const navItems: NavItem[] = [
    {
      to: "/dashboard",
      label: "My Scorecard",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    ...(complianceRole === "manager" || complianceRole === "hr_admin" || complianceRole === "compliance_officer" || isAdmin
      ? [
          {
            to: "/admin/dashboard",
            label: "HR Dashboard",
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            to: "/admin/employees",
            label: "Employees",
            icon: <Users className="w-4 h-4" />,
          },
          {
            to: "/admin/audit-logs",
            label: "Audit Logs",
            icon: <FileText className="w-4 h-4" />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            to: "/admin/requirements",
            label: "Requirements",
            icon: <Settings className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isActive(item.to)
              ? "bg-[#0066CC] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          {item.icon}
          {item.label}
          {isActive(item.to) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 z-10">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 leading-tight text-sm">{appName}</p>
              <p className="text-xs text-slate-400 truncate">{companyName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </Form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0066CC] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">{appName}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-black/30 pt-14" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-slate-200">
              <Form method="post" action="/auth/logout">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-0 lg:pt-0">
        <div className="lg:hidden h-14" />
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
