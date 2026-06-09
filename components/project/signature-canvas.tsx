"use client";

import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

interface SignatureCanvasProps {
  onChange: (isEmpty: boolean) => void;
  padRef: React.MutableRefObject<SignaturePad | null>;
}

export function SignatureCanvas({ onChange, padRef }: SignatureCanvasProps) {
  const sig = useAppDictionary().signature;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const context = canvas.getContext("2d");
      if (context) {
        context.scale(ratio, ratio);
      }
      padRef.current?.clear();
      onChange(true);
    };

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(0, 0, 0)",
    });

    padRef.current.addEventListener("endStroke", () => {
      onChange(padRef.current?.isEmpty() ?? true);
    });

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      padRef.current = null;
    };
  }, [onChange, padRef]);

  function handleClear() {
    padRef.current?.clear();
    onChange(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <canvas ref={canvasRef} className="h-40 w-full touch-none" />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleClear}>
        {sig.clearSignature}
      </Button>
    </div>
  );
}
