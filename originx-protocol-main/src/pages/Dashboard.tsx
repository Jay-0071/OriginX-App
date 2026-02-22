import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Server, Users, Wifi } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ResultPanel from "@/components/ResultPanel";
import { checkHealth, getRegistry } from "@/lib/api";

interface HealthData {
  status?: string;
  version?: string;
}

interface RegisteredUser {
  user_handle: string;
  public_key_hash: string;
  registered_at: string;
  media_count: number;
}

const Dashboard = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [records, setRecords] = useState<RegisteredUser[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem("originx_user") || "null");
  const isAdmin = user?.is_admin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("originx_token");
        const [healthRes, registryRes] = await Promise.all([
          checkHealth().catch(() => null),
          token ? getRegistry(token).catch(() => null) : Promise.resolve(null),
        ]);
        if (healthRes?.data) {
          setHealth(healthRes.data);
          setOnline(true);
        }
        if (registryRes?.data) {
          setRecords(registryRes.data.records || []);
        }
      } catch {
        setOnline(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      icon: Server,
      label: "Backend Status",
      value: online ? "ONLINE" : "OFFLINE",
      color: online ? "text-primary" : "text-destructive",
    },
    {
      icon: Activity,
      label: "API Version",
      value: health?.version || "—",
      color: "text-primary",
    },
    {
      icon: Users,
      label: "Identities",
      value: records.length.toString(),
      color: "text-primary",
    },
    {
      icon: Wifi,
      label: "System Status",
      value: online ? "OPERATIONAL" : "DEGRADED",
      color: online ? "text-primary" : "text-warning",
      dot: true,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            System <span className="text-gradient-neon">Dashboard</span>
          </h1>
          <p className="text-muted-foreground font-body">Real-time platform health and Merkle consent registry.</p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <GlassCard key={stat.label} delay={i * 0.1} hover={false}>
              <div className="flex items-start justify-between mb-4">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                {stat.dot && (
                  <div className={`w-3 h-3 rounded-full ${online ? "bg-primary animate-pulse-neon" : "bg-destructive"}`} />
                )}
              </div>
              <p className="text-muted-foreground text-xs font-mono tracking-wider uppercase mb-1">{stat.label}</p>
              <p className={`font-display text-lg font-bold ${stat.color}`}>{loading ? "..." : stat.value}</p>
            </GlassCard>
          ))}
        </div>

        {/* Consent Registry Table - Admin Only */}
        {isAdmin && (
          <ResultPanel title="Identity Manifest (Merkle Roots)">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-xs font-mono tracking-wider uppercase text-muted-foreground">User Handle</th>
                    <th className="text-left py-3 px-4 text-xs font-mono tracking-wider uppercase text-muted-foreground">Public Key Hash</th>
                    <th className="text-left py-3 px-4 text-xs font-mono tracking-wider uppercase text-muted-foreground">Media Assets</th>
                    <th className="text-left py-3 px-4 text-xs font-mono tracking-wider uppercase text-muted-foreground">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground font-body font-mono text-xs uppercase tracking-widest">Hydrating Registry...</td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground font-body">No registered identities yet.</td>
                    </tr>
                  ) : (
                    records.map((record, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-border/30 hover:bg-primary/5 transition-colors group"
                      >
                        <td className="py-3 px-4 font-body font-semibold text-foreground">@{record.user_handle}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-primary break-all max-w-[200px]">{record.public_key_hash}</td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground text-center">{record.media_count}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground">{new Date(record.registered_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ResultPanel>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
