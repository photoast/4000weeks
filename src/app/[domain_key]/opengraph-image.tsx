import { ImageResponse } from "next/og";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";
export const alt = "4000 WEEKS - 인생 시계";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ domain_key: string }>;
}) {
  const { domain_key } = await params;
  const collection = await getCollection("users");
  const user = await collection.findOne({ domain_key });

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: 48,
            fontFamily: "monospace",
          }}
        >
          4000 WEEKS
        </div>
      ),
      { ...size }
    );
  }

  const birth = new Date(user.birthdate);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeek = Math.floor((now.getTime() - birth.getTime()) / msPerWeek);
  const percent = ((currentWeek / 4000) * 100).toFixed(1);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "monospace",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 24, color: "#666", letterSpacing: "0.3em", display: "flex" }}>
          4000 WEEKS
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", display: "flex" }}>
          {user.username}님의 인생
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontSize: 120, fontWeight: 700, color: "#FF3B30" }}>{percent}%</span>
        </div>
        <div style={{ fontSize: 28, color: "#666", display: "flex" }}>
          {currentWeek.toLocaleString()}주 경과 · {(4000 - currentWeek).toLocaleString()}주 남음
        </div>
        {/* Progress bar */}
        <div
          style={{
            width: 800,
            height: 8,
            backgroundColor: "#222",
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${Math.min(100, parseFloat(percent))}%`,
              height: "100%",
              backgroundColor: "#FF3B30",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
