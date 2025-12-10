"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface RecognitionLike {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent | Event) => void) | null;
}

declare global {
  // eslint-disable-next-line no-var
  var webkitSpeechRecognition: {
    new (): RecognitionLike;
  } | undefined;
}

interface VoiceInputProps {
  onDone?: () => void;
}

export function VoiceInput({ onDone }: VoiceInputProps) {
  const router = useRouter();
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [open, setOpen] = useState(false);

  const sendThought = useCallback(
    async (text: string) => {
      setStatus("Processing…");
      setProcessing(true);
      try {
        const response = await fetch("/api/thoughtmap/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to add thought");
        }

        setStatus("Added!");
        onDone?.();
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setStatus("Unable to add thought");
      } finally {
        setProcessing(false);
      }
    },
    [onDone, router]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setStatus("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResult) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) {
        setStatus("No speech detected.");
        setListening(false);
        return;
      }

      setProcessing(true);
      void sendThought(transcript);
    };
    recognition.onstart = () => {
      setStatus("Listening…");
      setListening(true);
      setError(null);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.onerror = (event) => {
      const message = (event as SpeechRecognitionErrorEvent)?.error || "Speech recognition error";
      setError(message);
      setStatus("Error encountered");
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [sendThought]);

  const startListening = () => {
    if (!supported || !recognitionRef.current) return;
    if (processing) return;

    setError(null);
    setStatus("Listening…");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!supported || !recognitionRef.current) return;
    recognitionRef.current.stop();
    setStatus("Stopped");
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 transition"
        aria-expanded={open}
      >
        🎤 Add Thought (Voice)
      </button>

      {open && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">Voice Input</span>
            <span className="text-sm text-gray-600">{status}</span>
          </div>
          {!supported ? (
            <p className="text-sm text-red-600">
              Speech recognition is not supported in this browser.
            </p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={startListening}
                disabled={listening || processing}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
              >
                {listening ? "Listening…" : "Start microphone"}
              </button>
              <button
                type="button"
                onClick={stopListening}
                disabled={!listening}
                className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-800 shadow hover:bg-gray-300 transition disabled:opacity-60"
              >
                Stop
              </button>
            </div>
          )}
          {processing && (
            <p className="text-sm text-blue-700">Processing…</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default VoiceInput;
