import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  size = 200,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1.5,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) {
          console.error('QR code generation error:', error);
        }
      }
    );
  }, [value, size, darkColor, lightColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded-xl shadow-xs ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
