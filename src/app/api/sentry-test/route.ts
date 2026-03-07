import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    throw new Error("Sentry test error - this is intentional");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ ok: true, message: "Test error sent to Sentry" });
  }
}
