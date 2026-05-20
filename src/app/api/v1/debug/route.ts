import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  return NextResponse.json({
    hasKey: !!key,
    keyPrefix: key ? key.slice(0, 10) : null,
    proModel: process.env.MIMO_PRO_MODEL ?? "(unset)",
    vlModel: process.env.MIMO_VL_MODEL ?? "(unset)",
    nodeEnv: process.env.NODE_ENV,
  });
}
