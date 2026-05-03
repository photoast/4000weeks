"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  birthdate: string;
}

/**
 * 한국 표준시(KST) 기준 이번 주차 마감 시간 계산
 */
function getTimeUntilEndOfWeek() {
  const now = new Date(); // 현재 시간 (KST)
  
  // 1. 이번 주 일요일 자정(즉, 다음 월요일 00:00:00) 구하기
  const nextMonday = new Date(now);
  const day = now.getDay(); // 0(일), 1(월), ..., 6(토)
  
  // 오늘이 일요일(0)이면 1일 뒤, 아니면 (8 - 요일번호)일 뒤가 다음 월요일
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // 정확히 월요일 시작 시점(00:00:00)

  // 2. 남은 밀리초 계산
  const remaining = nextMonday.getTime() - now.getTime();

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}
/**
 * 숫자가 위아래로 굴러가는 슬롯머신 스타일의 숫자 컴포넌트
 */
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
              ease: [0.23, 1, 0.32, 1] // Apple 스타일의 부드러운 가속도
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
    const update = () => setTime(getTimeUntilEndOfWeek(birthdate));
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [birthdate]);

  // 하이드레이션 오류 방지 (서버와 클라이언트의 시간을 맞춤)
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