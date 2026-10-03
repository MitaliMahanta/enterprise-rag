"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Settings, Sparkles } from "lucide-react";
import { getHealth } from "@/lib/api";
import { navigation } from "@/lib/navigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getHealth()
      .then((health) => {
        if (mounted) setApiHealthy(health.status === "ok");
      })
      .catch(() => {
        if (mounted) setApiHealthy(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7ff] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[215px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col xl:w-[250px] 2xl:w-[280px]">
          <div className="flex h-[44px] items-center border-b border-slate-100 px-3 xl:h-[52px] xl:px-4 2xl:h-[60px] 2xl:px-5">
            <Link href="/assistant" className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm xl:size-8 2xl:size-9">
                <Sparkles size={15} className="xl:size-4 2xl:size-5" />
              </span>
              <span>
                <span className="block text-[13px] font-bold leading-4 xl:text-sm">Pulse AI</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 xl:text-[10px]">
                  Command center
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-2.5 py-4 xl:px-3 xl:py-5 2xl:px-4 2xl:py-6" aria-label="Main navigation">
            {navigation.map((group) => (
              <div key={group.section} className="mb-5 xl:mb-6 2xl:mb-7">
                <p className="px-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 xl:px-3 xl:text-xs">
                  {group.section}
                </p>
                <div className="mt-1.5 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveNavigationItem(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-md px-2.5 py-3 text-sm transition-colors xl:px-3 xl:py-3 xl:text-[15px] 2xl:py-3.5 ${
                          active
                            ? "bg-violet-50 font-semibold text-violet-800"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >
                        <Icon size={18} className={item.label === "Jira" ? "text-blue-600" : item.label === "GitHub" ? "text-slate-900" : item.label === "Slack" ? "text-rose-600" : undefined} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-2 xl:p-3">
            <Link
              href="/settings"
              aria-current={pathname === "/settings" ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-3 text-sm xl:px-3 xl:py-3 xl:text-[15px] 2xl:py-3.5 ${
                pathname === "/settings"
                  ? "bg-violet-50 font-semibold text-violet-800"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Settings size={17} /> Settings
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[44px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-3 sm:px-4 lg:px-4 xl:h-[52px] xl:px-5 2xl:h-[60px] 2xl:px-6">
            <Link href="/assistant" className="flex items-center gap-2 text-xs font-semibold lg:hidden">
              <Sparkles size={16} className="text-violet-700" /> Pulse AI
            </Link>
            <div className="hidden h-8 max-w-xl flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-slate-400 sm:flex lg:max-w-[min(42vw,390px)] xl:h-9 xl:max-w-[min(42vw,560px)] 2xl:h-10 2xl:px-3">
              <Search size={14} className="xl:size-4" />
              <span className="text-[11px] xl:text-xs">Search documents, conversations, or ask AI...</span>
              <kbd className="ml-auto rounded border border-slate-200 bg-white px-1 py-0.5 text-[9px] 2xl:text-[10px]">⌘ K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 text-[11px] text-slate-500 md:flex 2xl:text-xs">
                <span className={`size-1.5 rounded-full ${apiHealthy === true ? "bg-emerald-500" : apiHealthy === false ? "bg-red-500" : "bg-amber-400"}`} />
                {apiHealthy === true ? "API operational" : apiHealthy === false ? "API unavailable" : "Checking API"}
              </span>
              <button type="button" aria-label="Notifications" className="relative flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 2xl:size-9">
                <Bell size={16} />
              </button>
              <span className="flex size-7 items-center justify-center rounded-full bg-violet-600 text-[11px] font-semibold text-white 2xl:size-8" aria-label="Signed in as Mitali">
                M
              </span>
              <span className="hidden text-[11px] font-semibold text-slate-700 sm:block 2xl:text-xs">Mitali</span>
            </div>
          </header>

          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden" aria-label="Mobile navigation">
            {navigation.map((group) =>
              group.items.map((item) => {
                const Icon = item.icon;
                const active = isActiveNavigationItem(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-[13px] ${
                      active ? "bg-violet-50 font-semibold text-violet-800" : "text-slate-600"
                    }`}
                  >
                    <Icon size={16} className={item.label === "Jira" ? "text-blue-600" : item.label === "GitHub" ? "text-slate-900" : item.label === "Slack" ? "text-rose-600" : undefined} /> {item.label}
                  </Link>
                );
              }),
            )}
            <Link href="/settings" className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600">
              <Settings size={15} /> Settings
            </Link>
          </nav>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}

function isActiveNavigationItem(pathname: string, href: string) {
  return pathname === href || (href !== "/assistant" && pathname.startsWith(`${href}/`));
}