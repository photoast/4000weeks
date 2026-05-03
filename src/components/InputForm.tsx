"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function toRomanized(korean: string): string {
  const map: Record<string, string> = {
    ㄱ: "g", ㄴ: "n", ㄷ: "d", ㄹ: "r", ㅁ: "m", ㅂ: "b", ㅅ: "s",
    ㅇ: "", ㅈ: "j", ㅊ: "ch", ㅋ: "k", ㅌ: "t", ㅍ: "p", ㅎ: "h",
    ㄲ: "kk", ㄸ: "tt", ㅃ: "pp", ㅆ: "ss", ㅉ: "jj",
    ㅏ: "a", ㅓ: "eo", ㅗ: "o", ㅜ: "u", ㅡ: "eu", ㅣ: "i",
    ㅐ: "ae", ㅔ: "e", ㅑ: "ya", ㅕ: "yeo", ㅛ: "yo", ㅠ: "yu",
    ㅒ: "yae", ㅖ: "ye", ㅘ: "wa", ㅙ: "wae", ㅚ: "oe", ㅝ: "wo",
    ㅞ: "we", ㅟ: "wi", ㅢ: "ui",
  };
  const CHOSEONG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  const JUNGSEONG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
  const JONGSEONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

  let result = "";
  for (const char of korean) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const cho = Math.floor(offset / (21 * 28));
      const jung = Math.floor((offset % (21 * 28)) / 28);
      const jong = offset % 28;
      result += (map[CHOSEONG[cho]] || "") + (map[JUNGSEONG[jung]] || "") + (map[JONGSEONG[jong]] || "");
    } else {
      result += char;
    }
  }
  return result.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const steps = ["name", "id", "birth"] as const;
type Step = (typeof steps)[number];

export default function InputForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [username, setUsername] = useState("");
  const [domainKey, setDomainKey] = useState("");
  const [domainEdited, setDomainEdited] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [step]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (!domainEdited && /[가-힣]/.test(value)) {
      setDomainKey(toRomanized(value));
    }
  };

  const handleDomainChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setDomainKey(cleaned);
    setDomainEdited(true);
  };

  const next = () => {
    setError("");
    if (step === "name") {
      if (!username.trim()) { setError("이름을 입력해주세요"); return; }
      setStep("id");
    } else if (step === "id") {
      if (!domainKey.trim()) { setError("영문 ID를 입력해주세요"); return; }
      if (!/^[a-z0-9-]+$/.test(domainKey)) { setError("영문 소문자, 숫자, 하이픈만 가능해요"); return; }
      setStep("birth");
    } else {
      handleSubmit();
    }
  };

  const back = () => {
    setError("");
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") next();
  };

  const handleSubmit = async () => {
    if (!birthdate) { setError("생년월일을 선택해주세요"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, domain_key: domainKey, birthdate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      localStorage.setItem("4000weeks_user", domainKey);
      router.push(`/${domainKey}`);
    } catch {
      setError("서버에 연결할 수 없습니다");
      setLoading(false);
    }
  };

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-lg mx-auto h-full flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-[2px] bg-white/5">
        <motion.div
          className="h-full bg-white/40"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>

      {/* Back button */}
      <div className="px-6 pt-5 h-14 flex items-center">
        {stepIndex > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={back}
            className="text-white/40 text-sm hover:text-white/70 transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            이전
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 pb-8">
        <AnimatePresence mode="wait">
          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <p className="text-white/30 text-[13px] mb-3 tracking-wider">1 / 3</p>
              <h2 className="text-[24px] font-bold text-white tracking-tight leading-snug mb-10">
                이름을 알려주세요
              </h2>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="홍길동"
                className="w-full bg-white/[0.04] rounded-xl px-5 py-4 text-[18px] text-white placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </motion.div>
          )}

          {step === "id" && (
            <motion.div
              key="id"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <p className="text-white/30 text-[13px] mb-3 tracking-wider">2 / 3</p>
              <h2 className="text-[24px] font-bold text-white tracking-tight leading-snug mb-2">
                고유 주소를 정해주세요
              </h2>
              <p className="text-white/25 text-[14px] mb-8 leading-relaxed">
                이 주소로 나만의 인생 시계에 접속할 수 있어요
              </p>
              <input
                ref={inputRef}
                type="text"
                value={domainKey}
                onChange={(e) => handleDomainChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="gildong"
                className="w-full bg-white/[0.04] rounded-xl px-5 py-4 text-[18px] text-white placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <span className="text-white/20 text-[13px]">
                  4000weeks.kro.kr/
                </span>
                <span className="text-white/60 text-[13px] font-medium">
                  {domainKey || "..."}
                </span>
              </motion.div>
            </motion.div>
          )}

          {step === "birth" && (
            <motion.div
              key="birth"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <p className="text-white/30 text-[13px] mb-3 tracking-wider">3 / 3</p>
              <h2 className="text-[24px] font-bold text-white tracking-tight leading-snug mb-2">
                생년월일을 알려주세요
              </h2>
              <p className="text-white/25 text-[14px] mb-8 leading-relaxed">
                인생의 몇 번째 주인지 계산할게요
              </p>
              <input
                ref={inputRef}
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/[0.04] rounded-xl px-5 py-4 text-[18px] text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red text-[13px] mt-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 sm:px-10 pb-10">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={next}
          disabled={loading}
          className="w-full py-[16px] bg-white text-black font-semibold text-[15px] rounded-2xl hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-40"
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              생성 중...
            </motion.span>
          ) : step === "birth" ? (
            "인생 시계 만들기"
          ) : (
            "다음"
          )}
        </motion.button>
      </div>
    </div>
  );
}
