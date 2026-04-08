/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VisualEngine } from './components/VisualEngine';
import { Controls } from './components/Controls';
import { TextOverlay } from './components/TextOverlay';
import { useCamera } from './hooks/useCamera';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Camera as CameraIcon, Maximize2, Minimize2, Github } from 'lucide-react';

const DEFAULT_SETTINGS = {
  amount: 0.05,
  distortionX: 0.2,
  distortionY: 0.1,
  rgbSplit: 0.005,
  noiseAmount: 0.1,
  scanlines: 0.3,
  flicker: 0.05,
  freeze: 0.0,
  redTint: 0.1,
  glareIntensity: 0.2,
  flashFrequency: 1.0,
  syncDegree: 0.5,
  silhouetteMode: false,
  silhouetteColor: '#ff0000',
  glowIntensity: 0.5,
  trailLength: 0.9,
  contourSharpness: 1.0,
  contourThickness: 1.0,
  faceDetailIntensity: 0.5,
  subtleGlitchAmount: 0.1,
  trailStyle: 0
};

export default function App() {
  const { videoRef, startCamera, stopCamera, isActive, error } = useCamera();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [text, setText] = useState('AMNESIAC');
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleRandomize = () => {
    setSettings({
      amount: Math.random() * 0.3,
      distortionX: Math.random(),
      distortionY: Math.random(),
      rgbSplit: Math.random() * 0.05,
      noiseAmount: Math.random() * 0.3,
      scanlines: Math.random(),
      flicker: Math.random() * 0.5,
      freeze: Math.random() * 0.5,
      redTint: Math.random(),
      glareIntensity: Math.random() * 0.5,
      flashFrequency: Math.random() * 5.0,
      syncDegree: Math.random(),
      silhouetteMode: settings.silhouetteMode, // Keep current mode
      silhouetteColor: settings.silhouetteColor,
      glowIntensity: Math.random() * 1.5,
      trailLength: 0.7 + Math.random() * 0.25,
      contourSharpness: 0.5 + Math.random() * 1.5,
      contourThickness: 0.5 + Math.random() * 2.0,
      faceDetailIntensity: Math.random(),
      subtleGlitchAmount: Math.random() * 0.3,
      trailStyle: Math.floor(Math.random() * 3)
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setText('AMNESIAC');
  };

  const handleCapture = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `amnesiac-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `amnesiac-${Date.now()}.webm`;
        link.click();
        chunksRef.current = [];
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  }, [isRecording]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans selection:bg-red-500/30">
      {/* Sidebar Controls */}
      {!isFullscreen && (
        <Controls
          settings={settings}
          setSettings={setSettings}
          text={text}
          setText={setText}
          onRandomize={handleRandomize}
          onReset={handleReset}
          onCapture={handleCapture}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
        />
      )}

      {/* Main Viewport */}
      <main className="flex-1 relative flex flex-col">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center pointer-events-none">
          <div className="flex flex-col pointer-events-auto">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              placeholder="ENTER TEXT..."
              className="bg-transparent border-none text-white/40 font-mono text-xs tracking-[0.5em] focus-visible:ring-0 focus-visible:text-white w-64 p-0 h-auto uppercase"
            />
            <div className="h-[1px] w-full bg-white/10 mt-1" />
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className="text-white/30 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>
          </div>
        </div>

        {/* Visual Engine Container */}
        <div className="flex-1 relative">
          {isActive ? (
            <>
              <VisualEngine videoRef={videoRef} settings={settings} />
              <TextOverlay text={text} settings={settings} />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
              <div className="w-12 h-12 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                {error || "Initializing Optical Feed..."}
              </p>
              {!isActive && !error && (
                <Button 
                  onClick={startCamera}
                  className="mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-mono text-[10px] uppercase tracking-widest"
                >
                  Enable Camera
                </Button>
              )}
            </div>
          )}

          {/* Hidden video element for texture */}
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            muted
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="h-8 border-t border-white/10 flex items-center justify-between px-4 bg-black/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
                System Status: {isActive ? 'Operational' : 'Offline'}
              </span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-red-500">
                  Recording...
                </span>
              </div>
            )}
          </div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-white/20">
            © 2026 / Amnesiac Vision / Radiohead Inspired
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
