import { NextResponse } from "next/server";

export type ErrorResponse = {
  success: false;
  error: string;
  details?: string;
}

export function errorResponse(message: string, details?: string, status: number = 500): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details
    },
    { status }
  );
}
