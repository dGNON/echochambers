import { motion } from "framer-motion";
import { useEffect } from "react";

const pulseVariants = {
    initial: { scale: 0.95 },
    animate: {
        scale: 1,
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

const letterContainerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const letterVariants = {
    hidden: {
        opacity: 0,
        x: -10,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            ease: "easeOut",
            duration: 0.2,
        },
    },
};

const terminalLines = [
    { text: "Initializing environment", delay: 0 },
    { text: "Loading components", delay: 1.2 },
    { text: "Rendering interface", delay: 2.4 },
];

export const Loader = () => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        return () => {
            document.body.style.overflow = "unset";
            document.body.style.touchAction = "unset";
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md select-none touch-none overflow-hidden">
            <div className="relative">
                {/* Background pulse effect */}
                <motion.div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" variants={pulseVariants} initial="initial" animate="animate" />

                {/* Terminal container */}
                <motion.div className="relative flex flex-col items-start gap-3 min-w-[270px] bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-primary/20 overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Terminal header */}
                    <div className="flex gap-2 mb-2 w-full border-b border-primary/20 pb-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                        <div className="h-3 w-3 rounded-full bg-green-500/50" />
                    </div>

                    {/* Terminal content */}
                    <div className="font-mono text-sm space-y-2 overflow-hidden">
                        {terminalLines.map((line, index) => (
                            <motion.div key={index} className="flex items-center gap-2 text-primary/80" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: line.delay }}>
                                <span className="text-primary/60">$</span>
                                <motion.div className="flex overflow-hidden" variants={letterContainerVariants} initial="hidden" animate="visible" transition={{ delay: line.delay }}>
                                    {line.text.split("").map((letter, i) => (
                                        <motion.span key={i} variants={letterVariants} className="font-mono">
                                            {letter}
                                        </motion.span>
                                    ))}
                                </motion.div>
                                {index === terminalLines.length - 1 && <motion.div className="w-2 h-4 bg-primary/80" animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />}
                            </motion.div>
                        ))}
                    </div>

                    {/* Loading dots */}
                    <div className="w-full flex justify-center mt-2 pt-2 border-t border-primary/20">
                        <motion.div className="flex gap-1" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="h-[9px] w-[9px] rounded-full bg-primary"
                                    animate={{ scale: [0.9, 1.5, 0.9] }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
