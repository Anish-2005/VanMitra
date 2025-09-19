import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "../ThemeProvider";

const MagneticButton = ({ children, className = "", variant = "primary", ...props }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.1, y: y * 0.1 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const getVariantClass = () => {
    if (!mounted) {
      // Return a neutral class during SSR to prevent hydration mismatch
      return "bg-gray-200 border border-gray-300 text-gray-700";
    }

    switch (variant) {
      case "primary":
        return isLight
          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl"
          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl";
      
      case "secondary":
        return isLight
          ? "bg-green-100 border border-green-300 text-green-700 hover:bg-green-200 hover:border-green-400 shadow-md hover:shadow-lg"
          : "bg-white/10 backdrop-blur-sm border border-white/20 text-green-100 hover:bg-white/20";
      
      case "outline":
        return isLight
          ? "border-2 border-green-600 text-green-700 bg-transparent hover:bg-green-50 hover:text-green-800 shadow-sm hover:shadow-md"
          : "border border-white/20 text-white bg-transparent hover:bg-white/10";
      
      default:
        return isLight
          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl"
          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl";
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${getVariantClass()} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: mousePosition.x, y: mousePosition.y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
export default MagneticButton;