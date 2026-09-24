"use client";

import { useRef, useState } from "react";
import { uploadFile, uploadImage } from "@/lib/upload";

/** Campo de upload (imagem ou arquivo). Grava a URL num input hidden com o `name` informado. */
export default function ImageField({
  name,
  label,
  defaultValue = "",
  folder,
  hint,
  accept = "image/*",
  kind = "image",
  keepFormat = false,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder: string;
  hint?: string;
  accept?: string;
  kind?: "image" | "file";
  keepFormat?: boolean;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      setUrl(kind === "image" ? await uploadImage(file, folder, { keepFormat }) : await uploadFile(file, folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <input type="hidden" name={name} value={url} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={`relative flex min-h-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed p-3 text-center transition ${
          drag ? "border-brand bg-brand/5" : "border-line bg-paper-2"
        }`}
      >
        {url && kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="max-h-56 w-auto rounded object-contain" />
        )}
        {url && kind === "file" && (
          <a href={url} target="_blank" rel="noopener" className="break-all text-sm text-brand-dark underline">
            {decodeURIComponent(url.split("/").pop() ?? "arquivo")}
          </a>
        )}
        {!url && !busy && <p className="text-sm text-muted">Arraste aqui ou clique para enviar</p>}
        {busy && <p className="text-sm font-semibold text-brand-dark">Enviando…</p>}
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => input.current?.click()} disabled={busy}>
            {url ? "Trocar" : "Escolher arquivo"}
          </button>
          {url && (
            <button type="button" className="btn-danger" onClick={() => setUrl("")} disabled={busy}>
              Remover
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {hint && <p className="hint">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
