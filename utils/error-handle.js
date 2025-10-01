import { NextResponse } from "next/server";

import { AppError } from "./errors";

export function handleError(error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("Unexpected error:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again later.",
      },
    },
    { status: 500 }
  );
}
