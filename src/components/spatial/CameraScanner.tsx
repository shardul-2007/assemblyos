'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, RefreshCw, Upload, AlertCircle, SwitchCamera } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { cn } from '@/lib/utils';

interface CameraScannerProps {
  onCapture: (dataUrl: string, hint?: string) => void;
  onClose: () => void;
  forObjectName?: string;
}

type CameraState = 'requesting' | 'live' | 'denied' | 'unavailable' | 'error' | 'preview';

export function CameraScanner({ onCapture, onClose, forObjectName }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('requesting');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [flash, setFlash] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    stopStream();
    setState('requesting');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState('unavailable');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState('live');
    } catch (err: unknown) {
      stopStream();
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setState('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        if (facing === 'environment') {
          try {
            const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = fallback;
            if (videoRef.current) {
              videoRef.current.srcObject = fallback;
              await videoRef.current.play();
            }
            setState('live');
            return;
          } catch {
            // ignore
          }
        }
        setState('unavailable');
      } else {
        setErrorMsg(error.message || 'Camera initialization error');
        setState('error');
      }
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
    };
  }, [facingMode, startCamera, stopStream]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedUrl(url);
    setState('preview');
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
    stopStream();
  }, [stopStream]);

  const [capturedHint, setCapturedHint] = useState<string | undefined>(undefined);

  const handleRetake = useCallback(() => {
    setCapturedUrl(null);
    setCapturedHint(undefined);
    setState('requesting');
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  const handleConfirm = useCallback(() => {
    if (capturedUrl) {
      onCapture(capturedUrl, capturedHint);
    }
  }, [capturedUrl, capturedHint, onCapture]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedHint(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) {
        stopStream();
        setCapturedUrl(url);
        setState('preview');
      }
    };
    reader.readAsDataURL(file);
  }, [stopStream]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#080b0f] shadow-2xl"
      >
        {/* Flash effect */}
        {flash && (
          <div className="absolute inset-0 z-30 bg-white opacity-80 pointer-events-none transition-opacity duration-200" />
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <div>
            <TechnicalLabel variant="accent">SPATIAL CAMERA SCANNER</TechnicalLabel>
            {forObjectName ? (
              <p className="text-[13px] font-semibold text-[#F5F7FA] mt-0.5">
                Attach photo to: <span className="text-[#8BE9FF]">{forObjectName}</span>
              </p>
            ) : (
              <p className="text-[13px] font-semibold text-[#F5F7FA] mt-0.5">Scan Real Space or Machine</p>
            )}
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-xl text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            aria-label="Close camera"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Live stream */}
          {(state === 'requesting' || state === 'live') && (
            <div className="space-y-4">
              <div
                className="relative rounded-xl overflow-hidden bg-black border border-[rgba(255,255,255,0.08)]"
                style={{ aspectRatio: '4/3' }}
              >
                {state === 'requesting' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#080b0f]">
                    <div className="w-10 h-10 border-2 border-[#8BE9FF] border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[11px] text-[rgba(245,247,250,0.5)] uppercase tracking-widest">
                      Requesting camera access...
                    </span>
                  </div>
                )}

                <video
                  ref={videoRef}
                  className={cn('w-full h-full object-cover', state !== 'live' && 'opacity-0')}
                  playsInline
                  muted
                  autoPlay
                  aria-label="Live camera preview"
                />

                {/* Scan Frame HUD */}
                {state === 'live' && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-3/4 h-3/4 rounded-xl border border-[rgba(139,233,255,0.4)]"
                        style={{
                          boxShadow: '0 0 30px rgba(139,233,255,0.06), inset 0 0 30px rgba(139,233,255,0.06)',
                        }}
                      />
                    </div>
                    {/* Corner Reticles */}
                    <div className="absolute top-[12.5%] left-[12.5%] w-6 h-6 border-t-2 border-l-2 border-[#8BE9FF] pointer-events-none" />
                    <div className="absolute top-[12.5%] right-[12.5%] w-6 h-6 border-t-2 border-r-2 border-[#8BE9FF] pointer-events-none" />
                    <div className="absolute bottom-[12.5%] left-[12.5%] w-6 h-6 border-b-2 border-l-2 border-[#8BE9FF] pointer-events-none" />
                    <div className="absolute bottom-[12.5%] right-[12.5%] w-6 h-6 border-b-2 border-r-2 border-[#8BE9FF] pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgba(5,6,7,0.7)] backdrop-blur">
                      <span className="w-2 h-2 rounded-full bg-[#7DFFB2] animate-pulse" />
                      <span className="font-mono text-[10px] text-[#7DFFB2] uppercase tracking-wider font-semibold">
                        LIVE FEED
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-[rgba(5,6,7,0.7)] backdrop-blur">
                      <span className="font-mono text-[9px] text-[rgba(245,247,250,0.5)] uppercase tracking-widest">
                        {facingMode === 'environment' ? 'REAR SENSOR' : 'FRONT SENSOR'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-center font-mono text-[11px] text-[rgba(245,247,250,0.45)]">
                Align the machine or room area inside the frame.
              </p>

              {/* Controls */}
              <div className="flex items-center gap-3 pt-1">
                <GlowButton
                  variant="secondary"
                  size="sm"
                  icon={<SwitchCamera size={14} />}
                  onClick={switchCamera}
                  disabled={state !== 'live'}
                >
                  Switch
                </GlowButton>

                <button
                  onClick={handleCapture}
                  disabled={state !== 'live'}
                  className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-[13px] tracking-wider uppercase transition-all duration-200 disabled:opacity-40 shadow-[0_0_25px_rgba(139,233,255,0.25)]"
                  style={{
                    background: state === 'live' ? '#8BE9FF' : 'rgba(139,233,255,0.2)',
                    color: '#050607',
                  }}
                  aria-label="Capture photo"
                >
                  <Camera size={16} />
                  <span>CAPTURE PHOTO</span>
                </button>

                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="sr-only" />
                  <span className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border border-[rgba(255,255,255,0.18)] text-[rgba(245,247,250,0.8)] hover:text-[#8BE9FF] hover:border-[rgba(139,233,255,0.5)] transition-colors text-xs font-medium">
                    <Upload size={13} />
                    <span>Upload</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Captured Preview */}
          {state === 'preview' && capturedUrl && (
            <div className="space-y-4">
              <div
                className="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]"
                style={{ aspectRatio: '4/3' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedUrl} alt="Captured spatial photo" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[rgba(125,255,178,0.15)] border border-[rgba(125,255,178,0.3)] backdrop-blur">
                  <span className="font-mono text-[10px] text-[#7DFFB2] uppercase tracking-widest font-semibold">
                    ✓ PHOTO CAPTURED
                  </span>
                </div>
              </div>

              <p className="text-center font-mono text-[11px] text-[rgba(245,247,250,0.5)]">
                {forObjectName
                  ? `Attach this photo to ${forObjectName}?`
                  : 'Photo captured. Run AI spatial analysis to detect objects and equipment.'}
              </p>

              <div className="flex gap-3">
                <GlowButton variant="secondary" size="md" icon={<RefreshCw size={13} />} onClick={handleRetake} className="flex-1">
                  Retake
                </GlowButton>
                <GlowButton variant="primary" size="md" onClick={handleConfirm} className="flex-1">
                  {forObjectName ? 'Attach to Component' : 'Analyze Product'}
                </GlowButton>
              </div>
            </div>
          )}

          {/* Camera Denied */}
          {state === 'denied' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(255,127,138,0.1)] border border-[rgba(255,127,138,0.25)] flex items-center justify-center">
                <AlertCircle size={26} className="text-[#FF7F8A]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#F5F7FA]">CAMERA ACCESS BLOCKED</h3>
                <p className="text-[12px] text-[rgba(245,247,250,0.55)] max-w-sm mt-2 leading-relaxed">
                  Camera access is required to capture machines and spaces. Enable camera permission in your browser settings and try again.
                </p>
              </div>
              <div className="flex gap-3 w-full max-w-xs mt-2">
                <GlowButton variant="secondary" size="md" onClick={() => startCamera(facingMode)} className="flex-1">
                  Try Again
                </GlowButton>
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="sr-only" />
                  <span className="inline-flex items-center justify-center gap-1.5 w-full h-10 px-3 rounded-xl bg-transparent border border-[rgba(255,255,255,0.18)] text-[rgba(245,247,250,0.8)] hover:text-[#8BE9FF] hover:border-[rgba(139,233,255,0.5)] transition-colors text-xs font-medium">
                    <Upload size={13} />
                    <span>Upload</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Camera Unavailable */}
          {state === 'unavailable' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(255,211,106,0.1)] border border-[rgba(255,211,106,0.25)] flex items-center justify-center">
                <Camera size={26} className="text-[#FFD36A]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#F5F7FA]">No Camera Found</h3>
                <p className="text-[12px] text-[rgba(245,247,250,0.55)] max-w-xs mt-2 leading-relaxed">
                  No camera device was detected on your system. You can upload any photo from your machine instead.
                </p>
              </div>
              <label className="cursor-pointer mt-2">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="sr-only" />
                <span className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#8BE9FF] text-[#050607] font-semibold hover:bg-white transition-colors text-xs">
                  <Upload size={14} />
                  <span>Upload Photo</span>
                </span>
              </label>
            </div>
          )}

          {/* Generic Error */}
          {state === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <AlertCircle size={26} className="text-[#FF7F8A]" />
              <p className="text-[13px] text-[rgba(245,247,250,0.6)]">
                {errorMsg || 'Failed to start camera device.'}
              </p>
              <GlowButton variant="secondary" size="md" onClick={() => startCamera(facingMode)}>
                Retry Camera
              </GlowButton>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" aria-hidden />
      </motion.div>
    </div>
  );
}
