import { motion } from "framer-motion";

// Glass Card Component
const GlassCard = ({ children, className = "", hover = true, ...props }) => (
  <motion.div
    className={`backdrop-blur-xl bg-white/10 border border-white/20 hover:border-green-400/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 ${className}`}
    whileHover={hover ? {
      scale: 1.02
    } : {}}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    {...props}
  >
    {children}
  </motion.div>
);// Magnetic Button Component
export default GlassCard;