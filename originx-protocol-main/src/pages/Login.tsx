import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Lock, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { loginUser } from "@/lib/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle || !password) return;

        setLoading(true);
        setError(null);
        try {
            const res = await loginUser({ user_handle: handle, password });
            sessionStorage.setItem("originx_token", res.data.access_token);
            sessionStorage.setItem("originx_user", JSON.stringify(res.data.user));
            toast.success(`Welcome back, @${res.data.user.handle}!`);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.detail || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32">
            <div className="container mx-auto px-6 max-w-xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 neon-glow">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                        Secure <span className="text-gradient-neon">Login</span>
                    </h1>
                    <p className="text-muted-foreground font-body">Access your OriginX identity and media vault.</p>
                </motion.div>

                <GlassCard hover={false}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-mono text-muted-foreground tracking-wider uppercase mb-2">
                                User Handle
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    placeholder="e.g. jdoe"
                                    className="w-full bg-input border border-border rounded-lg py-3 px-10 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-mono text-muted-foreground tracking-wider uppercase mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-input border border-border rounded-lg py-3 px-10 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-destructive text-sm font-mono">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-neon text-primary-foreground py-3.5 rounded-lg font-display text-sm font-bold tracking-wider neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Login to OriginX"}
                        </button>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Don't have an identity yet? <Link to="/register" className="text-primary hover:underline font-semibold">Register here</Link>
                        </p>

                        <div className="pt-6 border-t border-border/50">
                            <Link
                                to="/admin-login"
                                className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-destructive transition-colors group"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 group-hover:animate-pulse-neon" />
                                Administrative Portal
                            </Link>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default Login;
