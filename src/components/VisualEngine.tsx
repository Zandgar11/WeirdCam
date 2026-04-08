
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { glitchShader } from '../shaders/glitchShader';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_LIPS } from '@mediapipe/face_mesh';

interface VisualEngineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  settings: {
    amount: number;
    distortionX: number;
    distortionY: number;
    rgbSplit: number;
    noiseAmount: number;
    scanlines: number;
    flicker: number;
    freeze: number;
    redTint: number;
    glareIntensity: number;
    flashFrequency: number;
    silhouetteMode: boolean;
    silhouetteColor: string;
    glowIntensity: number;
    trailLength: number;
    contourSharpness: number;
    contourThickness: number;
    faceDetailIntensity: number;
    subtleGlitchAmount: number;
    trailStyle: number;
  };
}

const ShaderPlane = ({ videoRef, settings }: VisualEngineProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, gl } = useThree();
  const [maskTexture, setMaskTexture] = useState<THREE.CanvasTexture | null>(null);
  const [faceMaskTexture, setFaceMaskTexture] = useState<THREE.CanvasTexture | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Create video texture
  const videoTexture = useMemo(() => {
    if (!videoRef.current) return null;
    const tex = new THREE.VideoTexture(videoRef.current);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.format = THREE.RGBAFormat;
    return tex;
  }, [videoRef.current]);

  // Create render targets for freeze frame effect
  const renderTarget1 = useMemo(() => new THREE.WebGLRenderTarget(size.width, size.height), [size]);
  const renderTarget2 = useMemo(() => new THREE.WebGLRenderTarget(size.width, size.height), [size]);
  const currentTarget = useRef(renderTarget1);
  const prevTarget = useRef(renderTarget2);

  // MediaPipe Setup
  useEffect(() => {
    if (!settings.silhouetteMode) return;

    // --- Selfie Segmentation ---
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({ modelSelection: 1 });

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = 640;
    maskCanvas.height = 480;
    maskCanvasRef.current = maskCanvas;
    const maskCtx = maskCanvas.getContext('2d');
    const maskTex = new THREE.CanvasTexture(maskCanvas);
    setMaskTexture(maskTex);

    selfieSegmentation.onResults((results) => {
      if (!maskCtx || !maskCanvasRef.current) return;
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.drawImage(results.segmentationMask, 0, 0, maskCanvas.width, maskCanvas.height);
      maskTex.needsUpdate = true;
    });

    // --- Face Mesh ---
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 640;
    faceCanvas.height = 480;
    faceCanvasRef.current = faceCanvas;
    const faceCtx = faceCanvas.getContext('2d');
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    setFaceMaskTexture(faceTex);

    faceMesh.onResults((results) => {
      if (!faceCtx || !faceCanvasRef.current || !results.multiFaceLandmarks) {
        if (faceCtx) faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
        faceTex.needsUpdate = true;
        return;
      }

      faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
      faceCtx.strokeStyle = '#ffffff';
      faceCtx.lineWidth = 1;

      for (const landmarks of results.multiFaceLandmarks) {
        // Draw Tesselation (subtle)
        faceCtx.globalAlpha = 0.2;
        drawConnectors(faceCtx, landmarks, FACEMESH_TESSELATION, { color: '#ffffff', lineWidth: 0.5 });
        
        // Draw Eyes and Lips (sharper)
        faceCtx.globalAlpha = 1.0;
        drawConnectors(faceCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#ffffff', lineWidth: 1.5 });
        drawConnectors(faceCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#ffffff', lineWidth: 1.5 });
        drawConnectors(faceCtx, landmarks, FACEMESH_LIPS, { color: '#ffffff', lineWidth: 1.5 });
      }
      faceTex.needsUpdate = true;
    });

    // Helper for drawing connectors (MediaPipe style)
    function drawConnectors(ctx: CanvasRenderingContext2D, landmarks: any[], connections: any[][], options: any) {
      ctx.beginPath();
      ctx.strokeStyle = options.color;
      ctx.lineWidth = options.lineWidth;
      for (const connection of connections) {
        const from = landmarks[connection[0]];
        const to = landmarks[connection[1]];
        if (from && to) {
          ctx.moveTo(from.x * faceCanvas.width, from.y * faceCanvas.height);
          ctx.lineTo(to.x * faceCanvas.width, to.y * faceCanvas.height);
        }
      }
      ctx.stroke();
    }

    let animationFrameId: number;
    const processVideo = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        await selfieSegmentation.send({ image: videoRef.current });
        await faceMesh.send({ image: videoRef.current });
      }
      animationFrameId = requestAnimationFrame(processVideo);
    };

    processVideo();

    return () => {
      cancelAnimationFrame(animationFrameId);
      selfieSegmentation.close();
      faceMesh.close();
    };
  }, [settings.silhouetteMode, videoRef]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(glitchShader.uniforms),
      vertexShader: glitchShader.vertexShader,
      fragmentShader: glitchShader.fragmentShader,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !videoTexture) return;

    const { uniforms } = material;
    uniforms.tDiffuse.value = videoTexture;
    uniforms.tPrev.value = prevTarget.current.texture;
    uniforms.tMask.value = maskTexture;
    uniforms.tFaceMask.value = faceMaskTexture;
    uniforms.time.value = state.clock.getElapsedTime();
    uniforms.amount.value = settings.amount;
    uniforms.distortion_x.value = settings.distortionX;
    uniforms.distortion_y.value = settings.distortionY;
    uniforms.rgbSplit.value = settings.rgbSplit;
    uniforms.noiseAmount.value = settings.noiseAmount;
    uniforms.scanlines.value = settings.scanlines;
    uniforms.flicker.value = settings.flicker;
    uniforms.freeze.value = settings.freeze;
    uniforms.redTint.value = settings.redTint;
    uniforms.glareIntensity.value = settings.glareIntensity;
    uniforms.flashFrequency.value = settings.flashFrequency;
    uniforms.silhouetteMode.value = settings.silhouetteMode ? 1.0 : 0.0;
    uniforms.silhouetteColor.value = new THREE.Color(settings.silhouetteColor);
    uniforms.glowIntensity.value = settings.glowIntensity;
    uniforms.trailLength.value = settings.trailLength;
    
    // New settings
    uniforms.contourSharpness.value = settings.contourSharpness;
    uniforms.contourThickness.value = settings.contourThickness;
    uniforms.faceDetailIntensity.value = settings.faceDetailIntensity;
    uniforms.subtleGlitchAmount.value = settings.subtleGlitchAmount;
    uniforms.trailStyle.value = settings.trailStyle;

    // Render to target for feedback
    gl.setRenderTarget(currentTarget.current);
    gl.render(state.scene, state.camera);
    gl.setRenderTarget(null);

    // Swap targets for feedback/freeze effect
    const temp = currentTarget.current;
    currentTarget.current = prevTarget.current;
    prevTarget.current = temp;
  });

  return (
    <mesh ref={meshRef} scale={[size.width, size.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export const VisualEngine = ({ videoRef, settings }: VisualEngineProps) => {
  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100] }}
        gl={{ antialias: false, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ShaderPlane videoRef={videoRef} settings={settings} />
      </Canvas>
    </div>
  );
};
