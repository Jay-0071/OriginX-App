import { motion } from "framer-motion";
import { Fingerprint, Eye, FileCheck, ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import CyberScanner from "@/components/CyberScanner";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Fingerprint,
    title: "Identity Registration",
    description: "Generate cryptographic identity hashes from your unique seed phrase for media provenance.",
  },
  {
    icon: Shield,
    title: "Invisible Watermarking",
    description: "Embed invisible forensic watermarks into your media for tamper-proof authenticity.",
  },
  {
    icon: Eye,
    title: "Deepfake Detection",
    description: "AI-powered spectral and neural analysis to detect manipulated or synthetic media.",
  },
  {
    icon: FileCheck,
    title: "Consent Registry",
    description: "Immutable consent registry tracking all registered identities and their provenance data.",
  },
];

const stats = [
  { value: "256-bit", label: "Encryption" },
  { value: "< 2s", label: "Analysis" },
  { value: "99.7%", label: "Accuracy" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        {/* Animated gradient mesh overlay */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              background: [
                "radial-gradient(ellipse 600px 400px at 30% 40%, hsl(152 100% 50% / 0.06), transparent)",
                "radial-gradient(ellipse 600px 400px at 70% 60%, hsl(152 100% 50% / 0.08), transparent)",
                "radial-gradient(ellipse 600px 400px at 50% 30%, hsl(152 100% 50% / 0.05), transparent)",
                "radial-gradient(ellipse 600px 400px at 30% 40%, hsl(152 100% 50% / 0.06), transparent)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />
          <motion.div
            animate={{
              background: [
                "radial-gradient(ellipse 400px 300px at 70% 30%, hsl(180 100% 50% / 0.04), transparent)",
                "radial-gradient(ellipse 400px 300px at 30% 70%, hsl(180 100% 50% / 0.06), transparent)",
                "radial-gradient(ellipse 400px 300px at 60% 50%, hsl(180 100% 50% / 0.03), transparent)",
                "radial-gradient(ellipse 400px 300px at 70% 30%, hsl(180 100% 50% / 0.04), transparent)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute inset-0"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-10"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-primary tracking-[0.2em]">CRYPTOGRAPHIC MEDIA FORENSICS</span>
            </motion.div>

            {/* Logo Mark */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 15 }}
              className="flex justify-center mb-10"
            >
              <CyberScanner />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-display text-7xl md:text-[8rem] font-black mb-6 leading-none tracking-tight"
            >
              <span className="text-foreground">ORIGIN</span>
              <span className="text-gradient-neon">X</span>
            </motion.h1>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-[2px] w-64 mx-auto bg-gradient-to-r from-transparent via-primary/80 to-transparent mb-8"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-4xl font-body text-foreground/90 mb-5 font-medium tracking-wide"
            >
              Protecting Media Authenticity & Data Dignity
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground/80 font-body text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Register your identity, invisibly watermark your media, and detect deepfakes
              using forensic cryptographic analysis and AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(0, 255, 150, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="group gradient-neon text-primary-foreground px-8 py-4 rounded-full font-display text-sm font-bold tracking-wider neon-glow flex items-center gap-3 justify-center"
              >
                <Lock size={16} />
                Register Identity
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 255, 150, 0.1)", borderColor: "rgba(0, 255, 150, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/analyze")}
                className="group glass text-foreground px-8 py-4 rounded-full font-display text-sm font-bold tracking-wider transition-colors duration-300 flex items-center gap-3 justify-center border border-border/50"
              >
                <Eye size={16} />
                Analyze Image
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </motion.button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center gap-10 md:gap-24"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-display text-3xl md:text-5xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-sm font-mono text-muted-foreground tracking-widest uppercase mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-6 py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="font-mono text-sm text-primary tracking-[0.4em] uppercase">What We Do</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4">
            Core <span className="text-gradient-neon">Capabilities</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} delay={i * 0.1} className="py-8 px-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,255,150,0.1)]">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3 tracking-wide">{feature.title}</h3>
              <p className="text-muted-foreground font-body text-base leading-relaxed">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Bottom accent */}
      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
};

export default Index;
