import { useState, useRef, useEffect } from "react";

interface LockScreenProps {
  onUnlock: (password: string) => Promise<boolean>;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    setError(false);

    const ok = await onUnlock(password);

    if (!ok) {
      setLoading(false);
      setError(true);
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 600);
      inputRef.current?.focus();
    }
  }

  return (
    <div style={styles.overlay}>
      {/* Subtle animated background */}
      <div style={styles.bg} />

      <div style={{ ...styles.card, ...(shake ? styles.cardShake : {}) }}>
        {/* Lock icon */}
        <div style={styles.iconWrap}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#6366f1" }}
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
            />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 style={styles.title}>Restricted Access</h1>
        <p style={styles.subtitle}>Enter the access code to continue</p>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          <div style={styles.inputWrap}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Access code"
              autoComplete="current-password"
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {}),
              }}
            />
          </div>

          {error && (
            <p style={styles.errorMsg}>Incorrect access code. Try again.</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              ...styles.button,
              ...(loading || !password ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? <span style={styles.spinner} /> : "Unlock"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bgPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "hsl(var(--background, 240 10% 3.9%))",
    zIndex: 9999,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)",
    animation: "bgPulse 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    background: "hsl(var(--card, 240 10% 8%))",
    border: "1px solid hsl(var(--border, 240 3.7% 15.9%))",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    animation: "fadeIn 0.4s ease both",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  cardShake: {
    animation: "shake 0.5s ease",
  },
  iconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "hsl(var(--foreground, 0 0% 95%))",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "13px",
    color: "hsl(var(--muted-foreground, 240 5% 64.9%))",
    margin: "0 0 16px",
    textAlign: "center",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "1px solid hsl(var(--border, 240 3.7% 15.9%))",
    background: "hsl(var(--muted, 240 3.7% 10%))",
    color: "hsl(var(--foreground, 0 0% 95%))",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    letterSpacing: "0.1em",
  },
  inputError: {
    borderColor: "#ef4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.15)",
  },
  errorMsg: {
    fontSize: "12px",
    color: "#ef4444",
    margin: "-4px 0 0",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "11px",
    borderRadius: "10px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "42px",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
};
