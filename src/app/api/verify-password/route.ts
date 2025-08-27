import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 3;
const COOLDOWN_PERIOD = 60 * 60 * 1000; // 1 jam dalam milidetik

const HASHED_PASSWORD =
  process.env.PASSWORD_HASH ||
  "$2a$12$VHur4Rddk6SeSvPncYxFYu3rIBgxtJgid9zBBq4mvZseLmclvRPVG";
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_DEFAULT";

/**
 * Handles POST requests to verify the provided password.
 * This API route simulates a backend password verification process.
 * In a real application, the correctPassword would be stored securely
 * (e.g., in environment variables, a database, or a secret management service)
 * and hashed, not hardcoded.
 *
 * @param request The incoming Next.js Request object.
 * @returns A NextResponse indicating success or failure of the password verification.
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Inisialisasi atau perbarui data percobaan login untuk IP ini
    let attempts = loginAttempts.get(ip);
    const currentTime = Date.now();

    if (!attempts || currentTime - attempts.lastAttempt > COOLDOWN_PERIOD) {
      // Reset jika belum ada percobaan atau cooldown period telah berlalu
      attempts = { count: 0, lastAttempt: currentTime };
    }

    // Periksa rate limiting
    if (attempts.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Terlalu banyak percobaan login yang gagal. Silakan coba lagi setelah 1 jam.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    if (!password) {
      attempts.count++;
      attempts.lastAttempt = currentTime;
      loginAttempts.set(ip, attempts);
      return NextResponse.json(
        { success: false, message: "Kata sandi tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Verifikasi password menggunakan bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, HASHED_PASSWORD);

    if (isPasswordCorrect) {
      // Reset percobaan login setelah berhasil
      loginAttempts.delete(ip);

      // Buat JWT token
      const token = jwt.sign({ userId: "admin" }, JWT_SECRET, {
        expiresIn: "1d",
      });

      // Kirim token dalam response
      return NextResponse.json(
        { success: true, message: "Login berhasil!", token: token },
        { status: 200 }
      );
    } else {
      // Jika password salah, tingkatkan percobaan dan perbarui waktu
      attempts.count++;
      attempts.lastAttempt = currentTime;
      loginAttempts.set(ip, attempts);
      return NextResponse.json(
        { success: false, message: "Kata sandi salah. Silakan coba lagi." },
        { status: 401 }
      );
    }
  } catch (error) {
    // Handle any parsing errors or unexpected issues
    console.error("Error in /api/verify-password:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}

/**
 * Handles unsupported HTTP methods.
 * Ensures that only POST requests are allowed for this API route.
 *
 * @param request The incoming Next.js Request object.
 * @returns A NextResponse indicating that the method is not allowed.
 */
export async function GET() {
  return NextResponse.json(
    { message: "Metode tidak diizinkan." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Metode tidak diizinkan." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Metode tidak diizinkan." },
    { status: 405 }
  );
}
