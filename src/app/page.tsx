"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";
import HookingSequence from "@/components/HookingSequence";
import InputForm from "@/components/InputForm";

type Phase = "video" | "hooking" | "form";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("video");

  return (
    <main className="h-screen-safe bg-black relative overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <VideoPlayer onEnd={() => setPhase("hooking")} />
          </motion.div>
        )}

        {phase === "hooking" && (
          <motion.div
            key="hooking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            <HookingSequence onComplete={() => setPhase("form")} />
          </motion.div>
        )}

        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <InputForm />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
