"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminGesture() {
  const router = useRouter();
  const tapCount = useRef(0);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const onTap = () => {
    tapCount.current += 1;
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      tapCount.current = 0;
    }, 1500);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      router.push("/admin");
    }
  };

  return (
    <button
      type="button"
      aria-label="Admin"
      onClick={onTap}
      className="fixed left-0 top-0 z-50 h-10 w-10 opacity-0"
    />
  );
}
