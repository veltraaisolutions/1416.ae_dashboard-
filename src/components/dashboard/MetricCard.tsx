import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "highlight";
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: MetricCardProps) {
  const isHighlight = variant === "highlight";
  
  return (
    <div className={`
      glass-card-hover rounded-xl p-6 shine-effect
      ${isHighlight ? "border-primary/20 glow-gold" : ""}
    `}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold tracking-tight ${isHighlight ? "text-gradient-gold" : "text-foreground"}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={`
              inline-flex items-center text-xs font-medium px-2 py-1 rounded-full
              ${trend.isPositive 
                ? "bg-green-500/10 text-green-400" 
                : "bg-red-500/10 text-red-400"
              }
            `}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
            </div>
          )}
        </div>
        <div className={`
          h-12 w-12 rounded-xl flex items-center justify-center
          ${isHighlight 
            ? "bg-primary/10 text-primary" 
            : "bg-secondary text-muted-foreground"
          }
        `}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
