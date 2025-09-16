import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// Tooltip Component
const Tooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: position === "top" ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position === "top" ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-800/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl max-w-xs ${
              position === "top" ? "bottom-full left-1/2 transform -translate-x-1/2 mb-2" : "top-full left-1/2 transform -translate-x-1/2 mt-2"
            }`}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-slate-800/90 border-transparent transform rotate-45 ${
              position === "top" ? "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-800/90 border-r-slate-800/90" : "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-800/90 border-l-slate-800/90"
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Tooltip;