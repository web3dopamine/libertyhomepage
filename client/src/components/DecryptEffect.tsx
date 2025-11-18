import { useState, useEffect } from "react";

interface DecryptEffectProps {
  text: string;
  startDecrypting?: boolean;
  className?: string;
}

export function DecryptEffect({ text, startDecrypting = false, className = "" }: DecryptEffectProps) {
  const [decodedText, setDecodedText] = useState(startDecrypting ? "" : text);

  useEffect(() => {
    let iteration = 0;
    let shouldAnimate = true;
    const frameRate = 24;
    const speed = startDecrypting ? 0.3 : 0.5;

    const interval = setInterval(() => {
      if (!shouldAnimate) return;

      setDecodedText(() => {
        const result = text.split("").map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }

          return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"[
            Math.floor(Math.random() * 44)
          ];
        }).join("");

        iteration += speed;

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        return result;
      });
    }, 1000 / frameRate);

    return () => {
      shouldAnimate = false;
      clearInterval(interval);
    };
  }, [text, startDecrypting]);

  return (
    <span className={`inline-block font-inherit ${className}`}>
      {decodedText}
    </span>
  );
}

export function StableDecryptEffect({ text, className = "" }: Omit<DecryptEffectProps, 'startDecrypting'>) {
  const [decodedText, setDecodedText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    let shouldAnimate = true;
    const frameRate = 24;
    const speed = 0.5;

    const interval = setInterval(() => {
      if (!shouldAnimate) return;

      setDecodedText(() => {
        const result = text.split("").map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }

          return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"[
            Math.floor(Math.random() * 44)
          ];
        }).join("");

        iteration += speed;

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        return result;
      });
    }, 1000 / frameRate);

    return () => {
      shouldAnimate = false;
      clearInterval(interval);
    };
  }, [text]);

  return (
    <span className={`inline-block font-inherit ${className}`}>
      {decodedText}
    </span>
  );
}
