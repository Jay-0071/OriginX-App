import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResultPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const ResultPanel = ({ title, children, className = "" }: ResultPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`glass rounded-xl overflow-hidden ${className}`}
    >
      <div className="border-b border-border/50 px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
        <h3 className="font-display text-sm tracking-wider uppercase text-primary">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

export default ResultPanel;

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  color?: "green" | "yellow" | "red";
}

export const ScoreBar = ({ label, value, max = 100, color = "green" }: ScoreBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    green: "bg-primary",
    yellow: "bg-warning",
    red: "bg-destructive",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-body">{label}</span>
        <span className="font-mono text-foreground">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClasses[color]}`}
          style={{
            boxShadow:
              color === "green"
                ? "0 0 10px hsl(152 100% 50% / 0.5)"
                : color === "yellow"
                ? "0 0 10px hsl(45 100% 50% / 0.5)"
                : "0 0 10px hsl(0 80% 55% / 0.5)",
          }}
        />
      </div>
    </div>
  );
};
