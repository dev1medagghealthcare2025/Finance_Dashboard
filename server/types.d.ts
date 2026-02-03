export {};

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: import("@supabase/supabase-js").User;
    }
  }
}
