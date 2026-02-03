import { supabaseServer } from "../supabaseClient.js";

export const requireSupabaseUser = async (req, res, next) => {
  const header = req.header("authorization");

  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing Authorization Bearer token" });
  }

  const token = header.slice("bearer ".length).trim();

  const { data, error } = await supabaseServer.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.supabaseUser = data.user;
  return next();
};
