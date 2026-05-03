"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownProps {
  birthdate: string;
}

function getTimeUntilEndOfWeek(birthdate: string) {
  const birth = new Date(birthdate);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - birth.getTime();
  const currentWeek = Math.floor(elapsed / msPerWeek);
  const endOfThisWeek = new Date(birth.getTime() + (currentWeek + 1) * msPerWeek);
  const remaining = endOfThisWeek.getTime() - now.getTime();

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function TickerDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden h-10">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-3xl font-bold text-white tabular-nums block"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </div>
      <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ birthdate }: CountdownProps) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => setTime(getTimeUntilEndOfWeek(birthdate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [birthdate]);

  return (
    <div className="flex items-center gap-4">
      <TickerDigit value={time.days} label="일" />
      <span className="text-white/20 text-2xl -mt-4">:</span>
      <TickerDigit value={time.hours} label="시" />
      <span className="text-white/20 text-2xl -mt-4">:</span>
      <TickerDigit value={time.minutes} label="분" />
      <span className="text-white/20 text-2xl -mt-4">:</span>
      <TickerDigit value={time.seconds} label="초" />
    </div>
  );
}
