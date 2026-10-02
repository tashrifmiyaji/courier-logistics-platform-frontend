import { NextRequest, NextResponse } from "next/server";

const credentialsByRole = {
  CUSTOMER: {
    email: process.env.DEMO_CUSTOMER_EMAIL,
    password: process.env.DEMO_CUSTOMER_PASSWORD,
  },
  COURIER: {
    email: process.env.DEMO_COURIER_EMAIL,
    password: process.env.DEMO_COURIER_PASSWORD,
  },
  ADMIN: {
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
  },
} as const;

export async function POST(request: NextRequest) {
  const { role } = (await request.json().catch(() => ({}))) as {
    role?: keyof typeof credentialsByRole;
  };
  if (!role || !(role in credentialsByRole)) {
    return NextResponse.json(
      { message: "Choose a valid demo role." },
      { status: 400 },
    );
  }

  const credentials = credentialsByRole[role];
  if (!credentials.email || !credentials.password) {
    return NextResponse.json(
      {
        message: `Demo ${role.toLowerCase()} credentials are not configured on this deployment.`,
      },
      { status: 503 },
    );
  }

  const backend = (
    process.env.BACKEND_API_URL || "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
  const response = await fetch(`${backend}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "The courier API is unavailable." },
      { status: 502 },
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json(
      { message: body?.message || "Demo login could not be completed." },
      { status: response.status },
    );
  }

  const result = NextResponse.json(body);
  for (const cookie of response.headers.getSetCookie()) {
    result.headers.append("set-cookie", cookie);
  }
  return result;
}
