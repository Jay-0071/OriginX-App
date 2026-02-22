import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Fingerprint, Lock, User } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { registerUser } from "@/lib/api";
import { Link } from "react-router-dom";

const Register = () => {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [identityHash, setIdentityHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || !password || !seedPhrase) return;

    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({
        user_handle: handle,
        password,
        watermark_seed: seedPhrase,
      });
      setIdentityHash(res.data.public_key_hash);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register identity.");
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    if (identityHash) {
      navigator.clipboard.writeText(identityHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Identity <span className="text-gradient-neon">Registration</span>
          </h1>
          <p className="text-muted-foreground font-body">Create a cryptographically verifiable provenance identity.</p>
        </motion.div>

        <GlassCard hover={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-mono text-muted-foreground tracking-wider uppercase mb-2">
                Consent Seed Phrase
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  placeholder="Enter a secret phrase"
                  className="w-full bg-input border border-border rounded-lg py-3 px-10 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">This phrase is used to derive your unique watermark signature.</p>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-neon text-primary-foreground py-3.5 rounded-lg font-display text-sm font-bold tracking-wider neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 mt-4"
            >
              {loading ? "Generating Identity..." : "Create OriginX Identity"}
            </button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an identity? <Link to="/login" className="text-primary hover:underline">Login here</Link>
            </p>
          </form>
        </GlassCard>

        <AnimatePresence>
          {identityHash && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mt-8"
            >
              <GlassCard hover={false} glow>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 rounded-full gradient-neon mx-auto mb-4 flex items-center justify-center"
                  >
                    <Check className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <p className="font-display text-sm text-primary tracking-wider uppercase mb-4">Identity Hash Generated</p>
                  <p className="text-xs text-muted-foreground mb-4">Your public identity hash is stored on the Merkle Registry.</p>
                  <div className="glass rounded-lg p-4 flex items-center gap-3 mb-2">
                    <code className="text-primary font-mono text-xs flex-1 break-all">{identityHash}</code>
                    <button
                      onClick={copyHash}
                      className="shrink-0 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
