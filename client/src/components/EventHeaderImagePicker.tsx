import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X, Move, Crop, RotateCcw } from "lucide-react";

const CROP_ASPECT = 16 / 9;
const OUTPUT_W = 1200;
const OUTPUT_H = 675;

interface CropBox { x: number; y: number; w: number; h: number; }

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function EventHeaderImagePicker({ value, onChange }: Props) {
  const [step, setStep] = useState<"idle" | "crop">("idle");
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropAtStart, setCropAtStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawSrc(e.target?.result as string);
      setStep("crop");
    };
    reader.readAsDataURL(file);
  }

  function handleImgLoad() {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const displayW = container.offsetWidth;
    const displayH = Math.round((img.naturalHeight / img.naturalWidth) * displayW);

    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplaySize({ w: displayW, h: displayH });

    // Initial crop: full width, centered vertically; or adjusted if portrait
    const cropW = displayW;
    const cropH = cropW / CROP_ASPECT;

    if (cropH <= displayH) {
      setCropBox({ x: 0, y: Math.round((displayH - cropH) / 2), w: cropW, h: cropH });
    } else {
      const h = displayH;
      const w = Math.round(h * CROP_ASPECT);
      setCropBox({ x: Math.max(0, Math.round((displayW - w) / 2)), y: 0, w: Math.min(w, displayW), h });
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx >= cropBox.x && mx <= cropBox.x + cropBox.w && my >= cropBox.y && my <= cropBox.y + cropBox.h) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setCropAtStart({ x: cropBox.x, y: cropBox.y });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const newX = Math.max(0, Math.min(displaySize.w - cropBox.w, cropAtStart.x + dx));
    const newY = Math.max(0, Math.min(displaySize.h - cropBox.h, cropAtStart.y + dy));
    setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
  }

  function onPointerUp() {
    setIsDragging(false);
  }

  function applyCrop() {
    if (!rawSrc || !naturalSize.w) return;
    const scaleX = naturalSize.w / displaySize.w;
    const scaleY = naturalSize.h / displaySize.h;
    const srcX = Math.round(cropBox.x * scaleX);
    const srcY = Math.round(cropBox.y * scaleY);
    const srcW = Math.round(cropBox.w * scaleX);
    const srcH = Math.round(cropBox.h * scaleY);

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_W, OUTPUT_H);
      onChange(canvas.toDataURL("image/jpeg", 0.85));
      setStep("idle");
      setRawSrc(null);
    };
    img.src = rawSrc;
  }

  function cancelCrop() {
    setStep("idle");
    setRawSrc(null);
  }

  function clearImage() {
    onChange("");
    setStep("idle");
    setRawSrc(null);
  }

  // ── Step: crop ────────────────────────────────────────────────────────────
  if (step === "crop" && rawSrc) {
    const inCropBox = (e: React.PointerEvent) => {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      return mx >= cropBox.x && mx <= cropBox.x + cropBox.w && my >= cropBox.y && my <= cropBox.y + cropBox.h;
    };

    return (
      <div className="space-y-3">
        {/* Help text */}
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
          <Move className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-primary">Drag the highlighted area to reposition your crop</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Output: <span className="font-mono">{OUTPUT_W} × {OUTPUT_H}px</span> (16:9) &nbsp;·&nbsp;
              Source: <span className="font-mono">{naturalSize.w} × {naturalSize.h}px</span>
            </p>
          </div>
        </div>

        {/* Crop container */}
        <div
          ref={containerRef}
          className="relative rounded-lg overflow-hidden border border-border select-none"
          style={{ cursor: isDragging ? "grabbing" : "default" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Source image */}
          <img
            ref={imgRef}
            src={rawSrc}
            onLoad={handleImgLoad}
            className="w-full block"
            draggable={false}
            alt="Upload preview"
          />

          {cropBox.w > 0 && (
            <>
              {/* Dark overlay — top */}
              <div className="absolute left-0 right-0 top-0 bg-black/60 pointer-events-none" style={{ height: cropBox.y }} />
              {/* Dark overlay — bottom */}
              <div className="absolute left-0 right-0 bg-black/60 pointer-events-none" style={{ top: cropBox.y + cropBox.h, bottom: 0 }} />
              {/* Dark overlay — left */}
              <div className="absolute bg-black/60 pointer-events-none" style={{ top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.h }} />
              {/* Dark overlay — right */}
              <div className="absolute bg-black/60 pointer-events-none" style={{ top: cropBox.y, left: cropBox.x + cropBox.w, right: 0, height: cropBox.h }} />

              {/* Crop rectangle */}
              <div
                className="absolute border-2 border-white pointer-events-none"
                style={{ top: cropBox.y, left: cropBox.x, width: cropBox.w, height: cropBox.h }}
              >
                {/* Rule-of-thirds grid */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "33.33% 33.33%" }} />

                {/* Corner handles */}
                {[[-4, -4], [-4, undefined], [undefined, -4], [undefined, undefined]].map(([t, l], i) => (
                  <div
                    key={i}
                    className="absolute w-3.5 h-3.5 bg-white rounded-sm shadow"
                    style={{ top: t !== undefined ? t : "auto", bottom: t !== undefined ? "auto" : -4, left: l !== undefined ? l : "auto", right: l !== undefined ? "auto" : -4 }}
                  />
                ))}

                {/* Drag hint */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                    <Move className="w-3 h-3" />
                    Drag to reposition
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={cancelCrop} data-testid="button-cancel-crop">
            <X className="w-3.5 h-3.5 mr-1.5" />
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={applyCrop} data-testid="button-apply-crop">
            <Crop className="w-3.5 h-3.5 mr-1.5" />
            Apply Crop
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: idle — show upload zone or current image ────────────────────────
  if (value) {
    return (
      <div className="space-y-2">
        {/* Preview of current image */}
        <div className="relative rounded-lg overflow-hidden border border-border group" style={{ aspectRatio: "16/9" }}>
          <img src={value} alt="Event header" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-replace-image"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-background/80 backdrop-blur-sm"
              onClick={clearImage}
              data-testid="button-remove-image"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Hover over the image to replace or remove it.
        </p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}
        style={{ aspectRatio: "16/9" }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) loadFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        data-testid="dropzone-event-image"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isDragOver ? "Drop image here" : "Upload Event Header Image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to browse, or drag & drop
            </p>
          </div>
        </div>
      </div>

      {/* Dimension guide */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Crop className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
        <span>
          Recommended: <span className="font-mono font-semibold text-foreground">{OUTPUT_W} × {OUTPUT_H}px</span> (16:9 landscape) &nbsp;·&nbsp;
          Min: <span className="font-mono">800 × 450px</span> &nbsp;·&nbsp;
          Formats: JPG, PNG, WebP
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="input-event-image"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
