"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  birthdate: string;
}

// 1. 함수 정의 부분에서 birthdate 인자 타입을 명시적으로 추가했습니다.
function getTimeUntilEndOfWeek(birthdate: string) {
  const birth = new Date(`${birthdate}T00:00:00+09:00`);
  const now = new Date();
  
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - birth.getTime();
  
  const currentWeek = Math.floor(elapsed / msPerWeek);
  const endOfThisWeek = new Date(birth.getTime() + (currentWeek + 1) * msPerWeek);
  const remaining = endOfThisWeek.getTime() - now.getTime();

  const safeRemaining = Math.max(0, remaining);

  const days = Math.floor(safeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((safeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((safeRemaining % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function TickerDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <div className="relative overflow-hidden h-9 flex items-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -25, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.23, 1, 0.32, 1]
            }}
            className="text-3xl font-black text-white tabular-nums block"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-1.5">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ birthdate }: CountdownProps) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 2. 이제 getTimeUntilEndOfWeek가 인자를 정상적으로 받으므로 에러가 사라집니다.
    const update = () => setTime(getTimeUntilEndOfWeek(birthdate));
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [birthdate]);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <TickerDigit value={time.days} label="Days" />
      <span className="text-white/10 text-xl font-light mb-5 px-1">:</span>
      <TickerDigit value={time.hours} label="Hrs" />
      <span className="text-white/10 text-xl font-light mb-5 px-1">:</span>
      <TickerDigit value={time.minutes} label="Min" />
      <span className="text-white/10 text-xl font-light mb-5 px-1">:</span>
      <TickerDigit value={time.seconds} label="Sec" />
    </div>
  );
}