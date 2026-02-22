import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Server, Cpu, Activity, Database, GitBranch } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { checkHealth } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface HealthData {
    status: string;
    platform: string;
    tagline: string;
    merkle_root: string;
    version: string;
}

const AdminHealth = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = sessionStorage.getItem("originx_token");
    const currentUser = JSON.parse(sessionStorage.getItem("originx_user") || "null");

    useEffect(() => {
        if (!token || !currentUser?.is_admin) {
            navigate("/admin-login");
            return;
        }

        const fetchHealth = async () => {
            try {
                const res = await checkHealth();
                setHealth(res.data);
            } catch (err) {
                toast.error("Failed to connect to core systems.");
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        // Refresh every 30 seconds
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, [navigate, token, currentUser]);

    return (
        <div className="min-h-screen pt-24 pb-32">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                            <Activity className="text-primary w-8 h-8" />
                            System <span className="text-gradient-neon">Health</span>
                        </h1>
                        <p className="text-muted-foreground font-body">Privacy-preserving operational metrics and network architecture status.</p>
                    </motion.div>

                    <div className="flex items-center gap-3 px-4 py-2 border border-primary/30 rounded-full bg-primary/5">
                        <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-primary animate-pulse-neon' : 'bg-destructive'} `} />
                        <span className="text-xs font-mono uppercase tracking-widest text-primary">
                            {health?.status === 'ok' ? 'SYSTEM NOMINAL' : 'AWAITING TELEMETRY'}
                        </span>
                    </div>
                </div>

                {loading && !health ? (
                    <div className="flex justify-center py-20">
                        <Activity className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Core Status */}
                        <GlassCard>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Server size={24} />
                                    <h3 className="font-display font-bold font-xl">Core Services</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-mono text-muted-foreground">Platform</span>
                                        <span className="text-sm font-mono font-bold text-foreground">{health?.platform || 'OriginX'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-mono text-muted-foreground">Version</span>
                                        <span className="text-sm font-mono font-bold text-foreground">{health?.version || '1.0.0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-mono text-muted-foreground">Status</span>
                                        <span className="text-sm font-mono font-bold text-primary uppercase">{health?.status || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Merkle Node */}
                        <GlassCard className="md:col-span-2">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <GitBranch size={24} />
                                    <h3 className="font-display font-bold font-xl">Global Registry State</h3>
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-muted-foreground mb-2">Current Merkle Root Hash</p>
                                    <div className="p-4 bg-black/40 border border-primary/20 rounded-lg break-all">
                                        <code className="text-xs text-primary/80 font-mono">
                                            {health?.merkle_root || 'Initializing Registry...'}
                                        </code>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={12} className="text-primary" /> Cryptographically secured system state. Zero PII extracted.
                                </p>
                            </div>
                        </GlassCard>

                        {/* AI Engine - Static placeholder to fill the grid, represent logic layer */}
                        <GlassCard>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Cpu size={24} />
                                    <h3 className="font-display font-bold font-xl">Forensic Engine</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-mono text-muted-foreground">Model</span>
                                        <span className="text-sm font-mono font-bold text-foreground">Gemini 1.5 Pro</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-mono text-muted-foreground">DwtDct Codec</span>
                                        <span className="text-sm font-mono font-bold text-primary">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-mono text-muted-foreground">LSB Layer</span>
                                        <span className="text-sm font-mono font-bold text-primary">Active</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* DB State - Static placeholder */}
                        <GlassCard>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Database size={24} />
                                    <h3 className="font-display font-bold font-xl">Datastore</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-mono text-muted-foreground">Type</span>
                                        <span className="text-sm font-mono font-bold text-foreground">Relational</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span className="text-sm font-mono text-muted-foreground">Driver</span>
                                        <span className="text-sm font-mono font-bold text-foreground">SQLite3</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-mono text-muted-foreground">Connection</span>
                                        <span className="text-sm font-mono font-bold text-primary uppercase">Secure</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHealth;
