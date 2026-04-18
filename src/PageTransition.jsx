import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const KURU = {
  black:   "#0a0305",
  crimson: "#8b1a1a",
  red:     "#c0392b",
  gold:    "#c8a030",
  ivory:   "#f5e6c8",
};

function DefaultTransition() {
  const blocks = [KURU.black, KURU.crimson, KURU.gold];
  return blocks.map((color, i) => (
    <motion.div
      key={i}
      style={{
        position: "fixed",
        inset: 0,
        background: color,
        zIndex: 999 - i,
        originX: 0,
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: [0, 1, 1, 0] }}
      transition={{
        duration: 0.45,
        delay: i * 0.05,
        times: [0, 0.4, 0.6, 1],
        ease: [0.76, 0, 0.24, 1],
      }}
    />
  ));
}

function AboutTransition() {
  const panels = [
    { color: KURU.black,   top: "-12vh", left: "-18vw", width: "86vw", delay: 0    },
    { color: KURU.crimson, top: "24vh",  left: "-10vw", width: "72vw", delay: 0.05 },
    { color: KURU.ivory,   top: "58vh",  left: "-14vw", width: "82vw", delay: 0.1  },
  ];

  return panels.map((panel, i) => (
    <motion.div
      key={i}
      style={{
        position: "fixed",
        top: panel.top,
        left: panel.left,
        width: panel.width,
        height: "26vh",
        background: panel.color,
        zIndex: 999 - i,
        clipPath: "polygon(0 0, 100% 0, calc(100% - 120px) 100%, 0 100%)",
        transform: "rotate(-18deg)",
        transformOrigin: "left center",
      }}
      initial={{ x: -500, opacity: 0 }}
      animate={{ x: [-500, 20, 0], opacity: [1, 1, 0] }}
      transition={{
        duration: 0.52,
        delay: panel.delay,
        times: [0, 0.68, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  ));
}

function SocialsTransition() {
  const stripes = [
    { color: KURU.black,   left: "72vw", width: "24vw", delay: 0    },
    { color: KURU.crimson, left: "80vw", width: "14vw", delay: 0.06 },
    { color: KURU.gold,    left: "88vw", width: "8vw",  delay: 0.12 },
  ];

  return stripes.map((stripe, i) => (
    <motion.div
      key={i}
      style={{
        position: "fixed",
        top: "-6vh",
        left: stripe.left,
        width: stripe.width,
        height: "112vh",
        background: stripe.color,
        zIndex: 999 - i,
        transform: "skewX(-16deg)",
        transformOrigin: "top",
      }}
      initial={{ y: -1200, opacity: 1 }}
      animate={{ y: [-1200, 0, 0, 1200] }}
      transition={{
        duration: 0.56,
        delay: stripe.delay,
        times: [0, 0.42, 0.58, 1],
        ease: [0.76, 0, 0.24, 1],
      }}
    />
  ));
}

function TransitionOverlay({ variant }) {
  if (variant === "about")   return <AboutTransition />;
  if (variant === "socials")  return <SocialsTransition />;
  return <DefaultTransition />;
}

export default function PageTransition({ children, variant = "default" }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} style={{ position: "relative" }}>
        <TransitionOverlay variant={variant} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.18 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
