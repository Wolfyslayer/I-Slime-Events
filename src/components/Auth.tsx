import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      const profile = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      if (profile.data?.is_admin) {
        onLogin();
      } else {
        setError("Du har inte adminbehörighet.");
      }
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl mb-4">Admin Login</h2>
      <input
        className="w-full p-2 mb-2 rounded bg-background border border-accent"
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-background border border-accent"
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-accent text-black py-2 px-4 rounded hover:brightness-110"
        onClick={login}
      >
        Logga in
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}