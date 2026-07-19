"use client";

import { useState, useRef } from "react";

interface UploadError {
  row: number;
  reason: string;
}

interface UploadResult {
  imported: number;
  failed: number;
  errors: UploadError[];
}


interface Props {
  onSuccess?: () => void
}

export default function CsvUpload({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/feedback/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

       
      setResult(data);
      if (data.imported > 0) {
        onSuccess?.();
      }
      
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setUploadError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Bulk Import via CSV
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload a CSV with columns:{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">
          content, channel, customer_label, created_at
        </code>
      </p>

      {/* File input */}
      <div className="flex items-center gap-3 mb-4">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-3 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100 cursor-pointer"
        />
      </div>

      {file && (
        <p className="text-sm text-gray-600 mb-3">
          Selected: <span className="font-medium">{file.name}</span> (
          {(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium
          rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {/* Error message */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Result summary */}
      {result && (
        <div className="mt-4 space-y-3">
          {/* Success count */}
          {result.imported > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <span className="text-green-600 text-lg">✓</span>
              <p className="text-sm text-green-800 font-medium">
                {result.imported} row{result.imported !== 1 ? "s" : ""}{" "}
                imported successfully
              </p>
            </div>
          )}

          {/* Failed count */}
          {result.failed > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠ {result.failed} row{result.failed !== 1 ? "s" : ""} failed
                  validation
                </p>
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-xs text-yellow-700 underline"
                >
                  {showErrors ? "Hide" : "Show"} details
                </button>
              </div>

              {showErrors && (
                <ul className="mt-2 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-xs text-yellow-700">
                      Row {err.row}: {err.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* All failed edge case */}
          {result.imported === 0 && result.failed === 0 && (
            <p className="text-sm text-gray-500">
              The CSV was empty — no rows to import.
            </p>
          )}
        </div>
      )}
    </div>
  );
}