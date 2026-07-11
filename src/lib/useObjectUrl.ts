import { useEffect, useState } from "react";

// Object URL for a blob, revoked automatically when the blob changes or the
// component unmounts — for showing result previews without leaking memory.
export function useObjectUrl(blob: Blob | null): string {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!blob) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}
