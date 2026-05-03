"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import LifeGrid from "@/components/LifeGrid";
import Countdown from "@/components/Countdown";
import { getWeekInfo } from "@/components/LifeGrid";

interface UserData {
  username: string;
  domain_key: string;
  birthdate: string;
}

export default function DashboardPage() {
  const params = useParams();
  const domainKey = params.domain_key as string;
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${domainKey}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [domainKey]);

  const handleShare = async () => {
    if (!user) return;
    const { currentWeek, totalWeeks } = getWeekInfo(user.birthdate);
    const percent = ((currentWeek / totalWeeks) * 100).toFixed(1);
    const text = `${user.username}님은 인생 4,000주 중 ${currentWeek}번째 주를 살고 있습니다. (${percent}%)`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "4000 WEEKS", text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen-safe bg-black flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/40 text-sm tracking-widest"
        >
          LOADING
        </motion.div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-screen-safe bg-black flex flex-col items-center justify-center gap-6 px-8">
        <p className="text-white/40 text-sm">존재하지 않는 페이지입니다.</p>
        <Link
          href="/"
          className="text-white/60 text-sm border-b border-white/20 pb-1 hover:text-white transition-colors"
        >
          나도 인생 시계 만들기
        </Link>
      </div>
    );
  }

  const { currentWeek, totalWeeks } = getWeekInfo(user.birthdate);

  return (
    <div className="h-screen-safe bg-black flex flex-col relative max-w-lg mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between px-5 pt-5 pb-2 z-10"
      >
        <Link href="/" className="text-white/30 text-[11px] tracking-[0.3em] font-bold hover:text-white/60 transition-colors">
          4000WEEKS
        </Link>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="text-white/60 text-[12px] tracking-wide">
            {copied ? "복사됨!" : "공유하기"}
          </span>
        </motion.button>
      </motion.header>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center px-5 pt-2 pb-4 z-10"
      >
        <h1 className="text-xl font-bold tracking-tighter text-white">
          {user.username}님의 <span className="text-red">4,000</span>주
        </h1>
        <p className="text-white/30 text-xs mt-1">
          {currentWeek.toLocaleString()}주 경과 · {(totalWeeks - currentWeek).toLocaleString()}주 남음
        </p>
      </motion.div>

      {/* Life Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
        className="flex-1 min-h-0 px-3"
      >
        <LifeGrid birthdate={user.birthdate} />
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center py-4 z-10"
      >
        <p className="text-white/30 text-[10px] tracking-widest uppercase mb-2">
          이번 주가 끝나기까지
        </p>
        <div className="flex justify-center">
          <Countdown birthdate={user.birthdate} />
        </div>
      </motion.div>

      {/* Floating CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="px-6 pb-8 z-10"
      >
        <Link
          href="/"
          className="block w-full py-3.5 text-center text-white/60 text-[13px] tracking-wide rounded-2xl border border-white/10 hover:border-white/25 hover:text-white/80 transition-all"
        >
          나도 인생 시계 만들기 →
        </Link>
      </motion.div>
    </div>
  );
}
