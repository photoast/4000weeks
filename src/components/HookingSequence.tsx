"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HookingSequenceProps {
  onComplete: () => void;
}

const lines = [
  { text: "당신의 인생은", delay: 0 },
  { text: "4,000주입니다.", delay: 1.4, highlight: true },
  { text: "그중 대부분은\n이미 지나갔습니다.", delay: 3.2 },
  { text: "사랑하는 사람과 저녁을 먹을 수 있는 횟수,", delay: 5.5 },
  { text: "바다를 볼 수 있는 여름의 수,", delay: 7.2 },
  { text: "아무것도 하지 않아도 되는 일요일 오후.", delay: 8.8 },
  { text: "전부 셀 수 있습니다.", delay: 10.5, highlight: true },
  { text: "남은 시간,\n당신은 무엇을 하시겠습니까?", delay: 12.5, big: true },
];

export default function HookingSequence({ onComplete }: HookingSequenceProps) {
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    lines.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleIndex(i), line.delay * 1000));
    });

    timers.push(
      setTimeout(() => setShowButton(true), (lines[lines.length - 1].delay + 2) * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-8 relative">
      <div className="max-w-md w-full flex flex-col items-center gap-1 min-h-[300px] justify-center">
        <AnimatePresence>
          {lines.map(
            (line, i) =>
              visibleIndex >= i && (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{
                    opacity: visibleIndex === i ? 1 : 0.2,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 0.9,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={`text-center whitespace-pre-line leading-relaxed ${
                    line.big
                      ? "text-[24px] font-bold tracking-tight text-white mt-6"
                      : line.highlight
                        ? "text-[18px] font-semibold text-white"
                        : "text-[16px] text-white/50 font-light"
                  }`}
                >
                  {line.highlight && !line.big ? (
                    <>
                      {line.text.split(/(\d[\d,]*주)/).map((part, j) =>
                        /\d[\d,]*주/.test(part) ? (
                          <span key={j} className="text-red">
                            {part}
                          </span>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </>
                  ) : (
                    line.text
                  )}
                </motion.p>
              )
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="absolute bottom-16 left-0 right-0 px-8 flex justify-center"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="w-full max-w-xs py-[18px] bg-white text-black font-semibold text-[15px] rounded-2xl hover:bg-white/90 active:bg-white/80 transition-colors"
            >
              내 남은 시간 확인하기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
