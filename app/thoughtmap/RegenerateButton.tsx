"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegenerateButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleClick = async () => {
    setRefreshing(true);
    try {
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
      aria-live="polite"
    >
      {refreshing ? "Regenerating…" : "Regenerate"}
    </button>
  );
}
