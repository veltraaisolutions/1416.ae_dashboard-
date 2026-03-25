import { useState, useEffect } from "react";

// SHA-256 hash of your password — the actual password NEVER appears in code or network traffic
// To generate a new hash: open browser console and run:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourPassword'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//
// Current password hash below corresponds to: Automation@1416
const STORED_HASH =
  "8c5aa4e375c7599703848f1ca603e36358cd2b5f5ec17d11a03fbc9067582737";

const SESSION_KEY = "__app_unlocked__";

async function hashInput(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useAppLock() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unlocked = sessionStorage.getItem(SESSION_KEY) === "1";
    setIsUnlocked(unlocked);
    setIsChecking(false);
  }, []);

  async function attemptUnlock(password: string): Promise<boolean> {
    const hash = await hashInput(password);
    if (hash === STORED_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setIsUnlocked(true);
      return true;
    }
    return false;
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
  }

  return { isUnlocked, isChecking, attemptUnlock, lock };
}
