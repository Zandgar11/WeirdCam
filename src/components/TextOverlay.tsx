
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TextOverlayProps {
  text: string;
  settings: {
    amount: number;
    rgbSplit: number;
    syncDegree: number;
    flicker: number;
    glareIntensity: number;
    silhouetteMode: boolean;
    silhouetteColor: string;
  };
}

export const TextOverlay = ({ text, settings }: TextOverlayProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    const interval = setInterval(() => {
      if (settings.silhouetteMode) {
        setIsGlitching(false);
        setDisplayText(text);
        setOffset({ x: 0, y: 0 });
        return;
      }

      // Synchronize glitch trigger with the 'amount' setting and 'syncDegree'
      const baseGlitchChance = settings.amount * 0.5;
      const syncModifier = settings.syncDegree;
      
      if (Math.random() < baseGlitchChance * (1 + syncModifier)) {
        setIsGlitching(true);
        
        // Character fragmentation
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        const fragmentationIntensity = settings.amount * settings.syncDegree;
        
        const glitched = text.split('').map(char => 
          Math.random() < fragmentationIntensity ? chars[Math.floor(Math.random() * chars.length)] : char
        ).join('');
        
        setDisplayText(glitched);
        
        // Tremble / Shift
        const shiftIntensity = 30 * settings.amount * settings.syncDegree;
        setOffset({
          x: (Math.random() - 0.5) * shiftIntensity,
          y: (Math.random() - 0.5) * shiftIntensity
        });
        
        setTimeout(() => {
          setDisplayText(text);
          setIsGlitching(false);
          setOffset({ x: 0, y: 0 });
        }, 50 + Math.random() * 150);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [text, settings.amount, settings.syncDegree]);

  if (!text) return null;

  // Derived effects
  const rgbSplitAmount = settings.rgbSplit * 100 * settings.syncDegree;
  const flickerOpacity = 1 - (Math.random() * settings.flicker * settings.syncDegree);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ 
            opacity: flickerOpacity, 
            scale: 1, 
            filter: 'blur(0px)',
            x: offset.x,
            y: offset.y,
          }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="relative"
        >
          {/* Main Text */}
          <h1 
            className="text-white font-mono text-6xl md:text-8xl font-bold uppercase tracking-[0.3em] text-center mix-blend-difference"
            style={{
              textShadow: settings.silhouetteMode 
                ? `0 0 20px ${settings.silhouetteColor}` 
                : (settings.glareIntensity > 0.3 ? `0 0 ${settings.glareIntensity * 20}px rgba(255, 0, 0, 0.5)` : 'none'),
              color: settings.silhouetteMode ? settings.silhouetteColor : 'white'
            }}
          >
            {displayText || text}
          </h1>

          {/* RGB Split Layers - Synchronized with video RGB split */}
          {!settings.silhouetteMode && (settings.rgbSplit > 0.001 || isGlitching) && (
            <>
              <motion.h1 
                animate={{ 
                  x: (isGlitching ? -rgbSplitAmount * 2 : -rgbSplitAmount),
                  opacity: 0.5 + (settings.syncDegree * 0.5)
                }}
                className="absolute inset-0 text-red-500 font-mono text-6xl md:text-8xl font-bold uppercase tracking-[0.3em] text-center mix-blend-screen"
              >
                {displayText || text}
              </motion.h1>
              <motion.h1 
                animate={{ 
                  x: (isGlitching ? rgbSplitAmount * 2 : rgbSplitAmount),
                  opacity: 0.5 + (settings.syncDegree * 0.5)
                }}
                className="absolute inset-0 text-cyan-500 font-mono text-6xl md:text-8xl font-bold uppercase tracking-[0.3em] text-center mix-blend-screen"
              >
                {displayText || text}
              </motion.h1>
            </>
          )}

          {/* Fragment lines */}
          {isGlitching && settings.syncDegree > 0.3 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-white/30 absolute" style={{ top: `${Math.random() * 100}%`, left: `${(Math.random() - 0.5) * 50}%` }} />
              <div className="w-full h-[2px] bg-red-500/30 absolute" style={{ top: `${Math.random() * 100}%`, right: `${(Math.random() - 0.5) * 50}%` }} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
