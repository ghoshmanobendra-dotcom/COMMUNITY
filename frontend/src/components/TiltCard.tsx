
import React, { useRef, useState } from "react";
import { motion, HTMLMotionProps, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

const TiltCard = ({ children, className, intensity = 15, ...props }: TiltCardProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d",
                rotateX,
                rotateY,
            }}
            className={cn("relative transition-all duration-200 ease-out", className)}
            {...props}
        >
            <div style={{ transform: "translateZ(50px)" }}>
                {children}
            </div>
            {/* Glossy overlay effect */}
            <div
                className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                style={{ transform: "translateZ(60px)" }}
            />
        </motion.div>
    );
};

export default TiltCard;
