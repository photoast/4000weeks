"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  onEnd: () => void;
}

export default function VideoPlayer({ onEnd }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false); // 재생 시작 여부
  const calledRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fireEnd = useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    onEnd();
  }, [onEnd]);

  // 버튼 클릭 시 호출되는 함수: 영상 재생 + 소리 켜기
  const handleStart = () => {
    setIsPlaying(true);
    if (iframeRef.current) {
      const contentWindow = iframeRef.current.contentWindow;
      // 유튜브 IFrame API 커맨드 전송
      contentWindow?.postMessage(JSON.stringify({ event: "command", func: "unMute" }), "*");
      contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
    }
  };

  useEffect(() => {
    // 실제 재생 버튼을 누른 시점부터 14초 카운트다운 시작
    if (isPlaying) {
      const timer = setTimeout(fireEnd, 13000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, fireEnd]);

  return (
    <div className="h-dvh w-full bg-black flex items-center justify-center relative overflow-hidden">
      <div className="w-full h-full max-w-[500px] mx-auto relative">
        <iframe
          ref={iframeRef}
          // autoplay=0으로 설정하여 대기 상태로 로드, enablejsapi=1 필수
          src="https://www.youtube.com/embed/9ltA6xvDscE?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=0&playsinline=1&enablejsapi=1&origin=*"
          className="absolute inset-0 w-full h-full pointer-events-none"
          allow="autoplay; encrypted-media"
        />
      </div>

      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-black"
          >
            <motion.button
              onClick={handleStart}
              className="flex flex-col items-center gap-6 group"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/5 group-hover:bg-white/10 group-active:scale-95 transition-all"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </motion.div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/80 text-[14px] font-bold tracking-[0.2em]">
                  인생 시계 시작하기
                </span>
                <span className="text-white/30 text-[11px] tracking-tight">
                  소리와 함께 웅장하게 시작됩니다
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 재생 중일 때만 나타나는 건너뛰기 버튼 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isPlaying ? 1 : 0 }}
        transition={{ delay: 2 }}
        onClick={fireEnd}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/20 text-[10px] tracking-[0.3em] font-black hover:text-white/50 transition-colors py-2 px-6 border border-white/5 rounded-full uppercase"
      >
        Skip
      </motion.button>
    </div>
  );
}