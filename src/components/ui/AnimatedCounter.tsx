import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null!);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const end = value;
      const incrementTime = duration / end;

      const timer = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount >= end) {
            clearInterval(timer);
            return end;
          }
          return prevCount + 1;
        });
      }, incrementTime);

      return () => clearInterval(timer);
    } else {
      return;
    }
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {count.toLocaleString()}
    </motion.span>
  );
};
export default AnimatedCounter;