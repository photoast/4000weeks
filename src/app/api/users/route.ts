import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, domain_key, birthdate } = body;

  if (!username || !domain_key || !birthdate) {
    return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
  }

  if (!/^[a-z0-9-]+$/.test(domain_key)) {
    return NextResponse.json({ error: "영문 소문자, 숫자, 하이픈만 사용 가능합니다." }, { status: 400 });
  }

  const collection = await getCollection("users");
  const existing = await collection.findOne({ domain_key });

  if (existing) {
    return NextResponse.json({ error: "이미 사용 중인 ID입니다." }, { status: 409 });
  }

  await collection.insertOne({
    username,
    domain_key,
    birthdate,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, domain_key });
}
