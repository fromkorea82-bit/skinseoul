'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RotateCcw, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface CameraCaptureProps {
  onImageCapture: (imageBase64: string) => void;
}

type Mode = 'select' | 'camera' | 'upload';
type CameraPermission = 'prompt' | 'granted' | 'denied';

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('select');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>('prompt');

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setError(null);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG or PNG)');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image file is too large. Please upload a file smaller than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCapturedImage(base64String);
      setError(null);
      setMode('upload');
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file (JPEG or PNG)');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image file is too large. Please upload a file smaller than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCapturedImage(base64String);
      setError(null);
      setMode('upload');
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const confirmImage = () => {
    if (capturedImage) {
      onImageCapture(capturedImage);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setError(null);
    setMode('select');
  };

  const handleUserMedia = () => {
    setCameraPermission('granted');
    setError(null);
  };

  const handleUserMediaError = () => {
    setCameraPermission('denied');
    setError('Camera permission denied. Please allow camera access or upload a photo instead.');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Selection */}
      {mode === 'select' && !capturedImage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('camera')}
            className="card hover:shadow-lg transition-shadow p-8 text-center"
          >
            <Camera className="mx-auto mb-4 text-primary-500" size={48} />
            <h3 className="text-h3 mb-2">Take a Photo</h3>
            <p className="text-sm text-neutral-500">
              Use your camera to take a selfie
            </p>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="card hover:shadow-lg transition-shadow p-8 text-center"
          >
            <Upload className="mx-auto mb-4 text-secondary-500" size={48} />
            <h3 className="text-h3 mb-2">Upload Photo</h3>
            <p className="text-sm text-neutral-500">
              Choose an existing photo or drag & drop
            </p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-700 text-sm">{error}</p>
            {cameraPermission === 'denied' && (
              <button
                onClick={() => {
                  setError(null);
                  fileInputRef.current?.click();
                }}
                className="text-red-600 underline text-sm mt-2"
              >
                Upload a photo instead
              </button>
            )}
          </div>
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && !capturedImage && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-neutral-900 aspect-video">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="btn-outline flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <button
              onClick={capturePhoto}
              className="btn-primary flex items-center gap-2"
              disabled={cameraPermission !== 'granted'}
            >
              <Camera size={18} />
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-neutral-100 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Captured photo preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="btn-outline flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Retake
            </button>
            <button
              onClick={confirmImage}
              className="btn-primary flex items-center gap-2"
            >
              <Check size={18} />
              Analyze This Photo
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-400">
          🔒 Your photo is processed securely and is never stored on our servers.
          We respect your privacy.
        </p>
      </div>
    </div>
  );
}
