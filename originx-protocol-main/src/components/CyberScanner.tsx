import { motion } from "framer-motion";

const CyberScanner = () => {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer spinning ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-primary/40"
            />

            {/* Counter-spinning inner ring */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-primary/20 border-t-primary shadow-[0_0_15px_rgba(0,255,150,0.3)]"
            />

            {/* Pulsing core */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-16 rounded-full bg-primary/20 blur-xl"
            />

            {/* Hexagon center */}
            <motion.svg
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "anticipate" }}
                width="80"
                height="80"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 drop-shadow-[0_0_15px_rgba(0,255,150,0.8)]"
            >
                <path
                    d="M18 2L32 10V26L18 34L4 26V10L18 2Z"
                    stroke="hsl(152, 100%, 50%)"
                    strokeWidth="1.5"
                    fill="rgba(0,255,150,0.1)"
                />
                <circle cx="18" cy="18" r="4" fill="hsl(152, 100%, 50%)" />
            </motion.svg>

            {/* Scanning beam */}
            <motion.div
                animate={{ y: ["-100%", "100%", "-100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-full h-1 bg-primary shadow-[0_0_20px_#00ff96] opacity-50 z-20"
            />
        </div>
    );
};

export default CyberScanner;
