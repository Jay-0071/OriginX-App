import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

const GlassCard = ({ children, className = "p-8", hover = true, glow = false, delay = 0 }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={hover ? { scale: 1.03, y: -8 } : undefined}
      className={`glass rounded-2xl transition-all duration-500 ${hover ? "hover:shadow-[0_20px_40px_-15px_rgba(0,255,150,0.15)] cursor-pointer" : ""} ${glow ? "neon-glow" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
