"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  onEnd: () => void;
}

export default function VideoPlayer({ onEnd }: VideoPlayerProps) {
  const [showUnmute, setShowUnmute] = useState(true);
  const calledRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fireEnd = useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    onEnd();
  }, [onEnd]);

  const handleUnmute = () => {
    setShowUnmute(false);
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "unMute" }),
        "*"
      );
    }
  };

  useEffect(() => {
    // YouTube iframe API: listen for state changes
    const handler = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        // state 0 = ended
        if (data.event === "onStateChange" && data.info === 0) {
          fireEnd();
        }
      } catch {}
    };
    window.addEventListener("message", handler);

    // Tell YouTube iframe to send us events once it loads
    const initListener = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening" }),
        "*"
      );
    };
    const initTimer = setTimeout(initListener, 1500);

    // Fallback: auto-transition after 62 seconds (covers most Shorts)
    const fallback = setTimeout(fireEnd, 62000);

    return () => {
      window.removeEventListener("message", handler);
      clearTimeout(initTimer);
      clearTimeout(fallback);
    };
  }, [fireEnd]);

  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative">
      <div className="w-full h-full max-w-[500px] mx-auto relative">
        <iframe
          ref={iframeRef}
          src="https://www.youtube.com/embed/9ltA6xvDscE?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=0&playsinline=1&enablejsapi=1&origin=*"
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {showUnmute && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          onClick={handleUnmute}
          className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/5"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </motion.div>
            <span className="text-white/60 text-[13px] tracking-[0.2em]">
              소리와 함께 시작하기
            </span>
          </div>
        </motion.button>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        onClick={fireEnd}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/25 text-[12px] tracking-[0.15em] hover:text-white/50 transition-colors py-2 px-4"
      >
        건너뛰기
      </motion.button>
    </div>
  );
}
