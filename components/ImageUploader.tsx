"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  dict: Dictionary["properties"]["form"]["uploader"];
  max?: number;
};

export function ImageUploader({ value, onChange, dict, max = 10 }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (value.length + uploaded.length >= max) break;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        uploaded.push(data.url as string);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? dict.errorGeneric);
        break;
      }
    }
    setBusy(false);
    if (uploaded.length) onChange([...value, ...uploaded]);
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <label className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50 transition">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={busy || value.length >= max}
        />
        <div className="text-sm text-slate-600">
          {busy ? dict.uploading : dict.prompt}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {value.length}/{max}
        </div>
      </label>

      {error && <div className="text-sm text-rose-600 mt-2">{error}</div>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
          {value.map((url) => (
            <div key={url} className="relative aspect-square rounded overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute inset-0 bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition"
              >
                {dict.remove}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
