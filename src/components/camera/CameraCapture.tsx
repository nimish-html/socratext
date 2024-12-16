"use client";

import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { getBookDetailsFromImage, getNoteFromImage } from '@/lib/gemini';

interface CameraCaptureProps {
  mode: 'book' | 'note';
  onCapture: (data: any) => void;
  onError: (error: string) => void;
}

export function CameraCapture({ mode, onCapture, onError }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "environment"
  };

  const capture = useCallback(async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      setImgSrc(imageSrc);
      setIsCaptured(true);
      setIsProcessing(true);

      // Remove the data:image/jpeg;base64, prefix
      const base64Image = imageSrc.split(',')[1];

      // Process with Gemini based on mode
      const result = mode === 'book' 
        ? await getBookDetailsFromImage(base64Image)
        : await getNoteFromImage(base64Image);

      onCapture(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef, mode, onCapture, onError]);

  const retake = () => {
    setImgSrc(null);
    setIsCaptured(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isCaptured ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="rounded-lg"
          />
          <Button 
            onClick={capture}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Capture'}
          </Button>
        </>
      ) : (
        <>
          <img 
            src={imgSrc || ''} 
            alt="captured" 
            className="rounded-lg"
          />
          <Button 
            onClick={retake}
            disabled={isProcessing}
          >
            Retake
          </Button>
        </>
      )}
    </div>
  );
} 