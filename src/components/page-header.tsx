import { Bell, Search, ShieldCheck, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="border-b border-border bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <div className="flex flex-wrap items-center gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="relative hidden lg:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input aria-label="ابحث" placeholder="ابحث..." className="w-72 pr-9 bg-background/40" />
        </div>

        <button className="relative h-9 w-9 rounded-lg border border-border bg-background/40 flex items-center justify-center hover:bg-accent transition-colors" aria-label="إشعارات">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-1.5">
          <ShieldCheck className="h-4 w-4 text-[color:var(--success)]" />
          <div className="text-xs">
            <div className="font-semibold">المدير</div>
            <div className="text-muted-foreground truncate max-w-[160px]">{user?.email ?? ""}</div>
          </div>
        </div>

        <Button size="sm" variant="ghost" onClick={logout} title="خروج">
          <LogOut className="h-4 w-4 ml-1" /> خروج
        </Button>

        {actions && <div className="w-full md:w-auto md:mr-2 flex gap-2">{actions}</div>}
      </div>
    </header>
  );
}
