import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ domain_key: string }> }
) {
  const { domain_key } = await params;
  const collection = await getCollection("users");
  const user = await collection.findOne({ domain_key });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    domain_key: user.domain_key,
    birthdate: user.birthdate,
  });
}
