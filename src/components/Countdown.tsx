"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  birthdate: string;
}

/**
 * 서버 타임존(UTC)에 상관없이 한국 시간(KST) 기준으로 
 * '이번 주 일요일 자정(월요일 00:00:00)'까지 남은 시간을 계산합니다.
 */
function getTimeUntilEndOfWeek(birthdate: string) {
  // birthdate 인자를 받도록 정의 (타입 에러 방지용)
  // 실제 '이번 주 마감'은 현재 요일 기준이므로 내부 로직에서 활용
  
  const now = new Date();
  
  // 1. 현재 시간을 KST(UTC+9) 기준으로 변환
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstNow = new Date(utc + (9 * 60 * 60 * 1000));

  // 2. KST 기준 다음 월요일 00:00:00 설정
  const target = new Date(kstNow);
  const day = kstNow.getDay(); // 0(일) ~ 6(토)
  
  // 오늘이 일요일(0)이면 1일 뒤, 그 외에는 다음 월요일까지 남은 일수 계산
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  
  target.setDate(kstNow.getDate() + daysUntilNextMonday);
  target.setHours(0, 0, 0, 0);

  // 3. KST 기준 현재와 타겟의 차이 계산
  const remaining = target.getTime() - kstNow.getTime();
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
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
    
    // 이제 getTimeUntilEndOfWeek가 birthdate를 인자로 받으므로 타입 에러가 발생하지 않습니다.
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