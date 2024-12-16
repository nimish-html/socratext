"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';

type Props = {
  bookId: string;
}

export default function CameraCapture({ bookId }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        // Set default to the environment facing camera on mobile if available
        const envCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        setSelectedDevice(envCamera?.deviceId || videoDevices[0]?.deviceId || null);
        setError(null);
      } catch (error) {
        console.error('Error getting devices:', error);
        setError('Failed to access camera devices. Please check permissions.');
      }
    };
    getDevices();
  }, []);

  const videoConstraints = {
    width: isMobile ? 720 : 1280,
    height: isMobile ? 1280 : 720,
    facingMode: isMobile ? "environment" : "user",
    deviceId: selectedDevice || undefined
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      )}

      {devices.length > 1 && !imgSrc && (
        <div className="mb-4">
          <select 
            value={selectedDevice || ''}
            onChange={handleDeviceChange}
            className="w-full p-2 border rounded-md"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {imgSrc ? (
        <div className="space-y-4">
          <img
            src={imgSrc}
            alt="captured"
            className="w-full rounded-lg shadow-md"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={retake}
              className="w-full sm:w-auto"
              variant="secondary"
            >
              Retake Photo
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = imgSrc;
                link.download = 'captured-page.jpg';
                link.click();
              }}
              className="w-full sm:w-auto"
            >
              Download Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full"
            />
          </div>
          <Button
            onClick={capture}
            className="w-full"
            disabled={!!error}
          >
            Capture Page
          </Button>
        </div>
      )}
    </div>
  );
} 