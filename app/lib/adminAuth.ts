import { supabaseAdmin } from "./supabaseAdmin";

export async function getAdminUser(req: Request) {
  const authorization =
    req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization
    .slice("Bearer ".length)
    .trim();

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    console.error(
      "ADMIN AUTH ERROR:",
      error
    );

    return null;
  }

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const userEmail =
    user.email?.trim().toLowerCase();

  if (
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    console.warn(
      "ADMIN ACCESS DENIED:",
      userEmail
    );

    return null;
  }

  return user;
}