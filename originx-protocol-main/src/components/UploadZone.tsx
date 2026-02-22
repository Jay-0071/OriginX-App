import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  preview?: string | null;
}

const UploadZone = ({ onFileSelect, accept = "image/*", label = "Drop image here or click to upload", preview }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative glass rounded-xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? "border-primary neon-glow"
          : "border-border hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center p-8 cursor-pointer min-h-[200px]">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-center text-sm text-muted-foreground mt-3 font-mono">
              {fileName}
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <p className="text-foreground font-body font-semibold text-lg mb-1">{label}</p>
            <p className="text-muted-foreground text-sm font-mono">PNG, JPG, WEBP up to 10MB</p>
          </>
        )}
      </label>
    </motion.div>
  );
};

export default UploadZone;
