import { NextResponse } from "next/server";

import { AppError } from "./errors";
import { ValidationError } from "yup";

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

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.errors.join(", "),
        },
      }, { status: 400 }
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
