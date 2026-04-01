import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link, X, ImageIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  testIdPrefix?: string;
}

export function LogoImagePicker({ value, onChange, label = "Logo", testIdPrefix = "logo" }: Props) {
  const [mode, setMode] = useState<"url" | "upload">(value && !value.startsWith("data:") ? "url" : "upload");
  const [urlInput, setUrlInput] = useState(value && !value.startsWith("data:") ? value : "");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleUrlApply() {
    onChange(urlInput.trim());
  }

  function handleClear() {
    onChange("");
    setUrlInput("");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Mode switcher */}
      <div className="flex gap-1 p-0.5 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            mode === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid={`${testIdPrefix}-mode-upload`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            mode === "url" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid={`${testIdPrefix}-mode-url`}
        >
          <Link className="w-3 h-3" />
          URL
        </button>
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
            isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          style={{ minHeight: "80px" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid={`${testIdPrefix}-drop-zone`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            data-testid={`${testIdPrefix}-file-input`}
          />
          {value ? (
            <div className="flex items-center gap-3 p-3">
              <img
                src={value}
                alt="Logo preview"
                className="h-10 max-w-[120px] object-contain"
              />
              <span className="text-xs text-muted-foreground flex-1">Click or drop to replace</span>
              <button
                type="button"
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                data-testid={`${testIdPrefix}-clear`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-5 gap-2 text-muted-foreground pointer-events-none">
              <ImageIcon className="w-6 h-6 opacity-40" />
              <span className="text-xs">Click or drag an image here</span>
            </div>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlApply(); } }}
              data-testid={`${testIdPrefix}-url-input`}
            />
            <Button type="button" size="sm" variant="outline" onClick={handleUrlApply} data-testid={`${testIdPrefix}-url-apply`}>
              Apply
            </Button>
          </div>
          {value && (
            <div className="flex items-center gap-2">
              <img src={value} alt="Logo preview" className="h-8 max-w-[120px] object-contain" />
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                onClick={handleClear}
                data-testid={`${testIdPrefix}-clear`}
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
