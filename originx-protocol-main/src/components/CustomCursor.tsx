import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Expand cursor when hovering over clickable elements
            if (
                target.tagName.toLowerCase() === "button" ||
                target.tagName.toLowerCase() === "a" ||
                target.closest("button") ||
                target.closest("a") ||
                target.classList.contains("cursor-pointer")
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    return (
        <>
            <style>{`
        body * {
          cursor: none !important;
        }
      `}</style>

            {/* Main tiny dot cursor */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-[#00ff96] rounded-full pointer-events-none z-[100] shadow-[0_0_10px_#00ff96]"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 0 : 1,
                }}
                transition={{
                    type: "tween",
                    ease: "backOut",
                    duration: 0.1,
                }}
            />

            {/* Trailing "antigravity" orbiting ring */}
            <motion.div
                className="fixed top-0 left-0 border border-[#00ff96]/50 rounded-full pointer-events-none z-[99] flex items-center justify-center mix-blend-screen"
                animate={{
                    x: mousePosition.x - (isHovering ? 32 : 16),
                    y: mousePosition.y - (isHovering ? 32 : 16),
                    width: isHovering ? 64 : 32,
                    height: isHovering ? 64 : 32,
                    backgroundColor: isHovering ? "rgba(0, 255, 150, 0.1)" : "transparent",
                }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    mass: 0.5,
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full rounded-full border-t border-t-[#00ff96] absolute"
                />
            </motion.div>
        </>
    );
};

export default CustomCursor;
