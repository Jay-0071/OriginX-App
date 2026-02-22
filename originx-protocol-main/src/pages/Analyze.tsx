import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, ShieldCheck, ShieldAlert, ShieldX, Eye, Radio, Brain, FileText, AlertTriangle, Scale, ArrowRight, Info } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import ResultPanel from "@/components/ResultPanel";
import { ScoreBar } from "@/components/ResultPanel";
import { analyzeImage } from "@/lib/api";
import GlassCard from "@/components/GlassCard";

interface AnalysisResult {
  is_deepfake: boolean;
  confidence: number;
  signals: any;
  gemini_analysis?: string;
  forensic_report?: string;
  violation_notice?: string;
  legal_guidance?: string;
  provenance: {
    watermark_found: boolean;
    matched_user: string | null;
    consent_violated: boolean;
    detection_type: string;
    verification_method: string | null;
  };
  image_hash: string;
}

const verdictConfig: any = {
  CLEAN: { icon: ShieldCheck, color: "text-primary", glow: "neon-glow", bg: "bg-primary/10", label: "SAFE & AUTHENTIC", sub: "No AI manipulation detected." },
  WATERMARK_AUTHENTIC: { icon: ShieldCheck, color: "text-primary", glow: "neon-glow", bg: "bg-primary/20", label: "VERIFIED ORIGINAL", sub: "Authenticity cryptographically confirmed." },
  SUSPICIOUS: { icon: ShieldAlert, color: "text-warning", glow: "", bg: "bg-warning/10", label: "POTENTIAL DEEPFAKE", sub: "Analysis shows suspicious artifacts." },
  SYNTHETIC_NO_MATCH: { icon: ShieldX, color: "text-destructive", glow: "", bg: "bg-destructive/10", label: "AI GENERATED", sub: "Content identified as synthetic media." },
  DIRECT_VIOLATION: { icon: AlertTriangle, color: "text-destructive", glow: "neon-glow-red", bg: "bg-destructive/20", label: "CONSENT BREACH", sub: "Unauthorized deepfake of your content!" },
};

const Analyze = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await analyzeImage(formData);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const detectionType = result?.provenance.detection_type || (result?.is_deepfake ? "SUSPICIOUS" : "CLEAN");
  const verdict = verdictConfig[detectionType] || verdictConfig.SUSPICIOUS;
  const VerdictIcon = verdict.icon;

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Safety <span className="text-gradient-neon">Check</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg">Instant deepfake detection and data rights verification.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <UploadZone onFileSelect={handleFileSelect} preview={preview} label="Select image for scan" />
            {error && <p className="text-destructive text-sm font-mono text-center">{error}</p>}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full gradient-neon text-primary-foreground py-4 rounded-xl font-display text-sm font-bold tracking-wider neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Scanning Media..." : "Verify Content"}
            </button>
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* Verdict Banner */}
                  <GlassCard hover={false} className={`border-none ${verdict.bg} ${verdict.glow}`}>
                    <div className="flex items-center gap-6 p-2">
                      <div className={`p-4 rounded-2xl bg-black/20`}>
                        <VerdictIcon className={`w-12 h-12 ${verdict.color}`} />
                      </div>
                      <div>
                        <h2 className={`font-display text-2xl font-bold ${verdict.color} mb-1 tracking-tight`}>{verdict.label}</h2>
                        <p className="text-sm font-body text-muted-foreground">{verdict.sub}</p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Trust Level */}
                  <div className="grid grid-cols-2 gap-4">
                    <GlassCard hover={false} className="py-4">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 text-center">Security Score</p>
                      <p className={`text-3xl font-display font-bold text-center ${result.confidence < 0.4 ? "text-primary" : "text-destructive"}`}>
                        {Math.round((1 - result.confidence) * 100)}%
                      </p>
                    </GlassCard>
                    <GlassCard hover={false} className="py-4 text-center flex flex-col justify-center items-center">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Provenance</p>
                      {result.provenance.watermark_found ? (
                        <div className="flex items-center gap-2 text-primary">
                          <ShieldCheck size={18} />
                          <span className="font-display text-xs font-bold">VERIFIED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ShieldX size={18} />
                          <span className="font-display text-xs font-bold">UNMARKED</span>
                        </div>
                      )}
                    </GlassCard>
                  </div>

                  {/* Summary & Advice */}
                  <div className="space-y-4">
                    {result.forensic_report && (
                      <div className="glass p-5 rounded-2xl border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-4 h-4 text-primary" />
                          <h3 className="text-xs font-display font-bold tracking-widest text-primary uppercase">Summary</h3>
                        </div>
                        <p className="text-sm font-body text-muted-foreground leading-relaxed italic">"{result.forensic_report}"</p>
                      </div>
                    )}

                    {result.legal_guidance && (
                      <div className="glass p-5 rounded-2xl border-indigo-500/30 bg-indigo-500/5">
                        <div className="flex items-center gap-2 mb-4">
                          <Scale className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-sm font-display font-bold tracking-widest text-indigo-300 uppercase">Personal Legal Assistant</h3>
                        </div>
                        <div className="space-y-3">
                          {result.legal_guidance.split('\n').filter(line => line.trim()).map((line, i) => (
                            <div key={i} className="flex gap-3 text-sm font-body text-indigo-100/80 items-start">
                              <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                              <p>{line.replace(/^\d+\.\s*/, '')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced Section */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto"
                    >
                      {showAdvanced ? "Hide Technical Details" : "Show Advanced Forensic Signals"}
                    </button>

                    {showAdvanced && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 space-y-4">
                        <ResultPanel title="Sensor Signature (Advanced)">
                          <div className="grid grid-cols-2 gap-4">
                            <ScoreBar label="Noise Consistency" value={result.signals.noise_score * 100} />
                            <ScoreBar label="Spectral Energy" value={result.signals.spectral_score * 100} />
                            <ScoreBar label="Grid Artifacts" value={result.signals.freq_score * 100} />
                            <ScoreBar label="Compression Map" value={result.signals.ela_score * 100} />
                          </div>
                        </ResultPanel>

                        {result.provenance.matched_user && (
                          <div className="glass p-3 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] font-mono text-muted-foreground">CRITICAL ID:</span>
                            <span className="text-[10px] font-mono text-primary font-bold">ORIGINALLY SIGNED BY @{result.provenance.matched_user}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Takedown Notice */}
                  {result.violation_notice && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-1 rounded-2xl bg-gradient-to-r from-destructive/20 to-indigo-500/20"
                    >
                      <div className="bg-black/80 backdrop-blur-xl p-6 rounded-[14px] border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="text-destructive animate-pulse" />
                          <h3 className="font-display text-sm font-bold text-destructive tracking-widest">TAKEDOWN ARTIFACT READY</h3>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground leading-normal mb-6 h-32 overflow-y-auto no-scrollbar border-l border-destructive/20 pl-4 italic">
                          {result.violation_notice}
                        </p>
                        <button className="w-full py-2 bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-display font-bold rounded-lg hover:bg-destructive hover:text-white transition-all">
                          DOWNLOAD EVIDENCE PACKAGE (.PDF)
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
