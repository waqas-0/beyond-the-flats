"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Generates a real, scannable QR pointing at the guide's public profile
// (/g/<id>?src=qr) and offers PNG + PDF downloads. Everything runs client-side;
// the QR is deterministic from the URL, so nothing needs to be stored.
export function GuideQrCard({ guideId, name }: { guideId: string; name: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/g/${guideId}?src=qr`;
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: "#062244", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [guideId]);

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "beyond-the-flats-qr.png";
    a.click();
  }

  function downloadPdf() {
    if (!dataUrl) return;
    const url = `${window.location.origin}/g/${guideId}?src=qr`;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor("#062244");
    pdf.text("Beyond The Flats", w / 2, 96, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(15);
    pdf.setTextColor("#43474f");
    pdf.text(name || "Verified Guide", w / 2, 124, { align: "center" });

    const size = 300;
    pdf.addImage(dataUrl, "PNG", (w - size) / 2, 168, size, size);

    pdf.setFontSize(13);
    pdf.setTextColor("#090909");
    pdf.text("Scan to view my verified guide profile", w / 2, 512, {
      align: "center",
    });
    pdf.setFontSize(10);
    pdf.setTextColor("#006a62");
    pdf.text(url, w / 2, 532, { align: "center" });

    pdf.save("beyond-the-flats-qr.pdf");
  }

  return (
    <div className="mt-5 rounded-[20px] bg-card p-6 text-center">
      <h3 className="text-xl font-bold text-ink">Your Guide QR Code</h3>
      <div className="mt-4 flex justify-center">
        <div className="rounded-xl bg-white p-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="Your profile QR code"
              width={176}
              height={176}
              className="h-44 w-44"
            />
          ) : (
            <div className="h-44 w-44 animate-pulse rounded bg-line" />
          )}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Clients scan this to view your verified profile, season stats, and recent
        catches instantly.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Button
          variant="primary"
          className="flex-1"
          onClick={downloadPng}
          disabled={!dataUrl}
        >
          <Download size={18} /> PNG
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={downloadPdf}
          disabled={!dataUrl}
        >
          <FileDown size={18} /> PDF
        </Button>
      </div>
    </div>
  );
}
