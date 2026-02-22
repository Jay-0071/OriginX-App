import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Lock, ShieldAlert, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { loginUser } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminLogin = () => {
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await loginUser({ user_handle: handle, password });
            if (!res.data.user.is_admin) {
                toast.error("Access Denied: Administrative privileges required.");
                return;
            }
            sessionStorage.setItem("originx_token", res.data.access_token);
            sessionStorage.setItem("originx_user", JSON.stringify(res.data.user));
            toast.success("SYSTEM ACCESS GRANTED");
            navigate("/admin-dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Authentication Failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 flex items-center justify-center p-6 bg-black">
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-block p-4 rounded-xl bg-destructive/10 mb-4 border border-destructive/20 animate-pulse">
                        <ShieldAlert className="w-10 h-10 text-destructive" />
                    </div>
                    <h1 className="font-mono text-2xl font-bold text-destructive tracking-widest uppercase">
                        Admin <span className="text-white">Portal</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs mt-2 uppercase tracking-tight">Authorized Personnel Only // Biometric Bypass Initialized</p>
                </motion.div>

                <GlassCard hover={false} className="border-destructive/30 bg-destructive/5!">
                    <div className="mb-6 p-3 bg-black/50 rounded border border-destructive/10 font-mono text-[10px] text-destructive/80 leading-relaxed">
                        <p className="flex items-center gap-2"><ChevronRight size={10} /> SECURITY_PROTOCOL: LEVEL_4_GOVERNANCE</p>
                        <p className="flex items-center gap-2"><ChevronRight size={10} /> ENCRYPTION: AES-256-GCM</p>
                        <p className="flex items-center gap-2"><ChevronRight size={10} /> STATUS: AWAITING_CREDENTIALS</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-mono text-destructive uppercase tracking-[0.2em]">Admin Handle</label>
                            <div className="relative">
                                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive/50" />
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    placeholder="root"
                                    className="w-full bg-black border border-destructive/20 rounded-md py-3 px-10 text-destructive font-mono text-sm placeholder:text-destructive/30 focus:outline-none focus:border-destructive transition-all shadow-[0_0_10px_rgba(255,0,0,0.05)]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-mono text-destructive uppercase tracking-[0.2em]">Master Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive/50" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black border border-destructive/20 rounded-md py-3 px-10 text-destructive font-mono text-sm placeholder:text-destructive/30 focus:outline-none focus:border-destructive transition-all shadow-[0_0_10px_rgba(255,0,0,0.05)]"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                className="bg-destructive/20 p-3 rounded border border-destructive/30 text-destructive text-[10px] font-mono uppercase text-center"
                            >
                                ERROR: {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-destructive text-white py-3.5 rounded-md font-mono text-xs font-bold tracking-[0.3em] uppercase hover:bg-destructive/80 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
                        >
                            {loading ? "Decrypting..." : "Initialize Session"}
                        </button>

                        <div className="pt-4 text-center">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-[9px] font-mono text-destructive/40 hover:text-destructive transition-colors uppercase tracking-[0.2em]"
                            >
                                [ Return to Public Portal ]
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminLogin;
