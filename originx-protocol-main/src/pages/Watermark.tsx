import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Stamp, Check, ShieldCheck, AlertCircle, Lock } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import UploadZone from "@/components/UploadZone";
import { verifyImage, embedWatermark } from "@/lib/api";
import { toast } from "sonner";

const Watermark = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "verify" | "declare" | "embed">("upload");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(sessionStorage.getItem("originx_user") || "null");

  const handleFileSelect = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setWatermarkedUrl(null);
    setStep("upload");
    setVerificationResult(null);
    setError(null);
  };

  const handleVerify = async () => {
    if (!file || !user) {
      if (!user) toast.error("You must be logged in to watermark images.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_handle", user.handle);
      const res = await verifyImage(formData);
      setVerificationResult(res.data);
      setStep("declare");
      toast.success("Image verified as authentic!");
    } catch (err: any) {
      setError(err.response?.data?.detail?.message || "Verification failed.");
      toast.error("Image failed verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmbed = async () => {
    if (!file || !password || !user) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_handle", user.handle);
      formData.append("password", password);
      formData.append("consent_accepted", "true");

      const res = await embedWatermark(formData);
      const blob = new Blob([res.data], { type: "image/png" });
      setWatermarkedUrl(URL.createObjectURL(blob));
      setStep("embed");
      toast.success("Watermark embedded successfully!");
    } catch (err: any) {
      setError(err.response?.data?.detail?.message || "Embedding failed. Check your password.");
      toast.error("Failed to embed watermark.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!watermarkedUrl) return;
    const a = document.createElement("a");
    a.href = watermarkedUrl;
    a.download = `originx_${file?.name || "image.png"}`;
    a.click();
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Secure <span className="text-gradient-neon">Watermarking</span>
          </h1>
          <p className="text-muted-foreground font-body">Cryptographically bind your identity to your original work.</p>
        </motion.div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <UploadZone onFileSelect={handleFileSelect} preview={preview} label="Upload original image" />
                {file && (
                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full gradient-neon text-primary-foreground py-3.5 rounded-lg font-display text-sm font-bold tracking-wider neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 mt-6"
                  >
                    {loading ? "Running Forensic Scan..." : "Verify Image Authenticity"}
                  </button>
                )}
              </motion.div>
            )}

            {step === "declare" && (
              <motion.div key="declare" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                <GlassCard hover={false} glow>
                  <div className="flex items-center gap-3 mb-4 text-primary">
                    <ShieldCheck className="w-6 h-6" />
                    <h2 className="font-display text-xl font-bold uppercase tracking-wider">Authenticity Verified</h2>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mb-6 font-body text-xs text-muted-foreground leading-relaxed italic">
                    {verificationResult?.ownership_declaration}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-mono text-muted-foreground tracking-wider uppercase">Confirm with Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your OriginX password"
                        className="w-full bg-input border border-border rounded-lg py-3 px-10 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    {error && <p className="text-destructive text-sm font-mono flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
                    <button
                      onClick={handleEmbed}
                      disabled={loading || !password}
                      className="w-full gradient-neon text-primary-foreground py-3.5 rounded-lg font-display text-sm font-bold tracking-wider neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                      {loading ? "Embedding Cryptographic Bound..." : "Accept Declaration & Embed"}
                    </button>
                    <button onClick={() => setStep("upload")} className="w-full text-muted-foreground text-xs hover:text-foreground transition-colors font-mono uppercase tracking-widest">Back</button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === "embed" && watermarkedUrl && (
              <motion.div key="embed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard hover={false}>
                    <p className="font-mono text-xs text-muted-foreground tracking-wider uppercase mb-3 text-center">Original</p>
                    <img src={preview!} alt="Original" className="rounded-lg w-full object-contain max-h-64" />
                  </GlassCard>
                  <GlassCard hover={false} glow>
                    <p className="font-mono text-xs text-primary tracking-wider uppercase mb-3 text-center">Watermarked & Registered</p>
                    <img src={watermarkedUrl} alt="Watermarked" className="rounded-lg w-full object-contain max-h-64" />
                  </GlassCard>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={downloadImage}
                    className="w-full gradient-neon text-primary-foreground py-3.5 rounded-lg font-display text-sm font-bold tracking-wider neon-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Watermarked Image
                  </button>
                  <button onClick={() => setStep("upload")} className="w-full glass py-3 rounded-lg font-display text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground hover:text-foreground">Watermark Another Image</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Watermark;
