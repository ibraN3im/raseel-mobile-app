import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  to: string;
  params?: Record<string, string>;
  label: string;
  className?: string;
};

export function BackLink({ to, params, label, className = "" }: BackLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      className={`mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
      {label}
    </Link>
  );
}
