import { motion } from "framer-motion";
import { ReactNode } from "react";

const contentVariants = {
    initial: { opacity: 0, scale: 0.95, filter: "blur(15px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.05, filter: "blur(15px)" },
};

const PageTransition = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={contentVariants}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full relative z-0"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
