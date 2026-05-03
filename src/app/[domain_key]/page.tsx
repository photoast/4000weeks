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
      await navigator.share({ title: "4000 WEEKS", text, url });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("링크가 복사되었습니다!");
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
      <div className="h-screen-safe bg-black flex flex-col items-center justify-center gap-6">
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
    <div className="h-screen-safe bg-black flex flex-col relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between px-5 pt-4 pb-2 z-10"
      >
        <Link href="/" className="text-white/40 text-xs tracking-[0.3em] font-bold hover:text-white/70 transition-colors">
          4000WEEKS
        </Link>
        <button
          onClick={handleShare}
          className="text-white/40 text-xs tracking-widest hover:text-white/70 transition-colors"
        >
          SHARE
        </button>
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
        className="flex-1 min-h-0 px-2"
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
        className="px-5 pb-6 z-10"
      >
        <Link
          href="/"
          className="block w-full py-3 text-center text-white/50 text-xs tracking-widest border border-white/10 hover:border-white/30 hover:text-white/80 transition-all"
        >
          나도 인생 시계 만들기 →
        </Link>
      </motion.div>
    </div>
  );
}
