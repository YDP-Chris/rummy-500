import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (typeof password !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const chrisPw = process.env.CHRIS_PASSWORD;
  const caitlynPw = process.env.CAITLYN_PASSWORD;

  if (chrisPw && password === chrisPw) {
    return NextResponse.json({ role: "chris", displayName: "Chris" });
  }
  if (caitlynPw && password === caitlynPw) {
    return NextResponse.json({ role: "caitlyn", displayName: "Caitlyn" });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
