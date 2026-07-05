import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import { downloadBlob } from "@/lib/format";
import { track } from "@/lib/analytics";

type Tab = "link" | "text" | "wifi";

function wifiString(ssid: string, password: string, enc: string): string {
  return `WIFI:T:${enc};S:${ssid};P:${password};;`;
}

export default function QrCodeGenerator() {
  const [tab, setTab] = useState<Tab>("link");
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [pass, setPass] = useState("");
  const [enc, setEnc] = useState("WPA");
  const [dataUrl, setDataUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  const payload = useMemo(() => {
    if (tab === "link") return link.trim();
    if (tab === "text") return text;
    return ssid ? wifiString(ssid, pass, enc) : "";
  }, [tab, link, text, ssid, pass, enc]);

  useEffect(() => {
    let cancelled = false;
    if (!payload) {
      setDataUrl("");
      setSvg("");
      setError("");
      return;
    }
    (async () => {
      try {
        const png = await QRCode.toDataURL(payload, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
        const svgStr = await QRCode.toString(payload, { type: "svg", margin: 2 });
        if (!cancelled) {
          setDataUrl(png);
          setSvg(svgStr);
          setError("");
          track("tool_used", { slug: "qr-code-generator", tab });
        }
      } catch {
        if (!cancelled) setError("Couldn't generate a QR code for that input.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload, tab]);

  const downloadPng = async () => {
    const res = await fetch(dataUrl);
    downloadBlob(await res.blob(), "qr-code.png");
    track("result_downloaded", { slug: "qr-code-generator", format: "png" });
  };
  const downloadSvg = () => {
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
    track("result_downloaded", { slug: "qr-code-generator", format: "svg" });
  };

  const altText = tab === "link" ? `QR code linking to ${link}` : tab === "wifi" ? `QR code for Wi-Fi network ${ssid}` : "QR code for text";

  return (
    <ToolShell
      result={
        dataUrl ? (
          <div className="card" style={{ textAlign: "center" }}>
            <img src={dataUrl} alt={altText} width={220} height={220} style={{ maxWidth: "100%", height: "auto", imageRendering: "pixelated" }} />
            <div className="wc-toolbar" style={{ justifyContent: "center", marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={downloadPng}>
                Download PNG
              </button>
              <button className="btn btn-sm" onClick={downloadSvg}>
                Download SVG
              </button>
            </div>
          </div>
        ) : null
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Segmented
          ariaLabel="QR type"
          value={tab}
          onChange={setTab}
          options={[
            { value: "link", label: "Link" },
            { value: "text", label: "Text" },
            { value: "wifi", label: "Wi-Fi" },
          ]}
        />
      </div>

      {tab === "link" && (
        <>
          <label className="field" htmlFor="qr-link">URL</label>
          <input id="qr-link" className="input" placeholder="https://example.com" value={link} onChange={(e) => setLink(e.target.value)} />
        </>
      )}
      {tab === "text" && (
        <>
          <label className="field" htmlFor="qr-text">Text</label>
          <textarea id="qr-text" className="textarea" placeholder="Any text to encode…" value={text} onChange={(e) => setText(e.target.value)} />
        </>
      )}
      {tab === "wifi" && (
        <div className="stack">
          <div>
            <label className="field" htmlFor="qr-ssid">Network name (SSID)</label>
            <input id="qr-ssid" className="input" value={ssid} onChange={(e) => setSsid(e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="qr-pass">Password</label>
            <input id="qr-pass" className="input" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="qr-enc">Security</label>
            <select id="qr-enc" className="input" value={enc} onChange={(e) => setEnc(e.target.value)}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
        </div>
      )}
      {error && <div style={{ marginTop: 12 }}><ErrorNotice>{error}</ErrorNotice></div>}
    </ToolShell>
  );
}
