
import * as THREE from 'three';

export const glitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    tPrev: { value: null },
    time: { value: 0 },
    amount: { value: 0.01 },
    angle: { value: 0.02 },
    seed: { value: 0.02 },
    seed_x: { value: 0.02 },
    seed_y: { value: 0.02 },
    distortion_x: { value: 0.5 },
    distortion_y: { value: 0.6 },
    col_s: { value: 0.05 },
    rgbSplit: { value: 0.01 },
    noiseAmount: { value: 0.1 },
    scanlines: { value: 0.5 },
    flicker: { value: 0.1 },
    freeze: { value: 0.0 },
    redTint: { value: 0.0 },
    glareIntensity: { value: 0.0 },
    flashFrequency: { value: 1.0 },
    silhouetteMode: { value: 0.0 },
    tMask: { value: null },
    silhouetteColor: { value: new THREE.Color(0.8, 0.0, 0.0) },
    glowIntensity: { value: 0.5 },
    trailLength: { value: 0.9 },
    contourSharpness: { value: 1.0 },
    contourThickness: { value: 1.0 },
    faceDetailIntensity: { value: 0.5 },
    subtleGlitchAmount: { value: 0.1 },
    trailStyle: { value: 0.0 },
    tFaceMask: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tPrev;
    uniform sampler2D tMask;
    uniform sampler2D tFaceMask;
    uniform float time;
    uniform float amount;
    uniform float distortion_x;
    uniform float distortion_y;
    uniform float rgbSplit;
    uniform float noiseAmount;
    uniform float scanlines;
    uniform float flicker;
    uniform float freeze;
    uniform float redTint;
    uniform float glareIntensity;
    uniform float flashFrequency;
    uniform float silhouetteMode;
    uniform vec3 silhouetteColor;
    uniform float glowIntensity;
    uniform float trailLength;
    uniform float contourSharpness;
    uniform float contourThickness;
    uniform float faceDetailIntensity;
    uniform float subtleGlitchAmount;
    uniform float trailStyle;

    varying vec2 vUv;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Sobel Edge Detection for Mask
    float getEdges(sampler2D tex, vec2 uv, float thickness) {
      vec2 texel = vec2(1.0 / 640.0, 1.0 / 480.0) * thickness;
      float t = texture2D(tex, uv + vec2(0, texel.y)).r;
      float b = texture2D(tex, uv - vec2(0, texel.y)).r;
      float l = texture2D(tex, uv - vec2(texel.x, 0)).r;
      float r = texture2D(tex, uv + vec2(texel.x, 0)).r;
      
      float gx = r - l;
      float gy = t - b;
      return sqrt(gx * gx + gy * gy);
    }

    void main() {
      vec2 uv = vUv;
      
      if (silhouetteMode > 0.5) {
        // --- SILHOUETTE MODE ---
        
        // Subtle Jitter on edges
        float edgeJitter = rand(vec2(time, floor(uv.y * 100.0))) * subtleGlitchAmount * 0.01;
        vec2 edgeUv = uv + vec2(edgeJitter, 0.0);
        
        float mask = texture2D(tMask, uv).r;
        float faceMask = texture2D(tFaceMask, uv).r;
        float edges = getEdges(tMask, edgeUv, contourThickness);
        
        // Sharpen edges
        edges = smoothstep(0.1 / contourSharpness, 0.5 / contourSharpness, edges);
        
        // Combine silhouette and face
        vec3 bodyColor = silhouetteColor;
        vec3 faceColor = silhouetteColor * 1.5; // Brighter face details
        
        vec3 finalColor = mix(vec3(0.0), bodyColor * 0.3, mask); // Dim body
        finalColor = mix(finalColor, bodyColor, edges); // Bright edges
        finalColor = mix(finalColor, faceColor, faceMask * faceDetailIntensity); // Face details
        
        // Glow
        float glow = 0.0;
        for(float i = -2.0; i <= 2.0; i++) {
          for(float j = -2.0; j <= 2.0; j++) {
            glow += texture2D(tMask, uv + vec2(i, j) * 0.005).r;
          }
        }
        glow /= 25.0;
        finalColor += silhouetteColor * (glow - mask) * glowIntensity;

        // Trails / Persistence
        vec4 prev = texture2D(tPrev, uv);
        float decay = trailLength;
        
        if (trailStyle > 1.5) { // Glitch lines
          decay *= 0.8 + 0.2 * rand(vec2(time, uv.y));
        } else if (trailStyle > 0.5) { // Sharp lines
          decay *= 0.95;
        }
        
        vec4 trailColor = mix(vec4(finalColor, 1.0), prev, decay);
        
        // Subtle RGB split on edges only
        if (subtleGlitchAmount > 0.0) {
          float split = subtleGlitchAmount * 0.005;
          float maskR = texture2D(tMask, uv + vec2(split, 0.0)).r;
          float maskB = texture2D(tMask, uv - vec2(split, 0.0)).r;
          finalColor.r = mix(finalColor.r, 1.0, (maskR - mask) * subtleGlitchAmount);
          finalColor.b = mix(finalColor.b, 1.0, (maskB - mask) * subtleGlitchAmount);
        }

        gl_FragColor = mix(vec4(finalColor, 1.0), trailColor, 0.8);
        
      } else {
        // --- GLITCH MODE ---
        float f = rand(vec2(time, 0.0));
        float flickerEffect = 1.0 - (f * flicker * 0.5);
        
        float ys = floor(gl_FragCoord.y / 0.5);
        float disp = rand(vec2(ys, time));
        if (disp < amount) {
          uv.x += (rand(vec2(time, ys)) - 0.5) * distortion_x;
        }
        
        vec4 cr = texture2D(tDiffuse, uv + vec2(rgbSplit, 0.0));
        vec4 cg = texture2D(tDiffuse, uv);
        vec4 cb = texture2D(tDiffuse, uv - vec2(rgbSplit, 0.0));
        
        vec4 color = vec4(cr.r, cg.g, cb.b, 1.0);
        
        if (freeze > 0.0) {
          vec4 prevColor = texture2D(tPrev, vUv);
          color = mix(color, prevColor, freeze);
        }

        float grain = noise(uv * 500.0 + time * 10.0);
        color.rgb = mix(color.rgb, color.rgb + (grain - 0.5) * 0.2, noiseAmount);

        float sLine = sin(uv.y * 400.0 + noise(vec2(time * 0.5, uv.y * 10.0)) * 10.0);
        float scanlineEffect = smoothstep(0.0, 1.0, sLine * 0.5 + 0.5);
        color.rgb *= mix(1.0, 0.8 + 0.2 * scanlineEffect, scanlines);

        color.r += redTint * 0.2;
        color.g -= redTint * 0.1;
        color.b -= redTint * 0.1;

        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        float flash = step(0.98, rand(vec2(time * flashFrequency, 1.0))) * rand(vec2(time, 2.0));
        float glare = (pulse * 0.3 + flash * 0.7) * glareIntensity;
        
        vec3 glareColor = vec3(0.4, 0.0, 0.0);
        color.rgb = mix(color.rgb, color.rgb + glareColor, glare);

        gl_FragColor = color * flickerEffect;
      }
    }
  `
};
