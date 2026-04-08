
import React from 'react';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RefreshCw, Camera, Video, Square, Download, Trash2, Zap } from 'lucide-react';

interface ControlsProps {
  settings: any;
  setSettings: (settings: any) => void;
  text: string;
  setText: (text: string) => void;
  onRandomize: () => void;
  onReset: () => void;
  onCapture: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const Controls = ({
  settings,
  setSettings,
  text,
  setText,
  onRandomize,
  onReset,
  onCapture,
  isRecording,
  onToggleRecording
}: ControlsProps) => {
  const updateSetting = (key: string, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-black/80 backdrop-blur-md border-r border-white/10 h-full overflow-y-auto custom-scrollbar w-80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Amnesiac.v1</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onRandomize} className="h-8 w-8 hover:bg-white/10">
            <Zap className="h-4 w-4 text-red-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 hover:bg-white/10">
            <Trash2 className="h-4 w-4 text-white/40" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <ControlGroup label="Overlay Text">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            placeholder="TYPE SOMETHING..."
            className="bg-white/5 border-white/10 text-white font-mono text-[10px] tracking-widest h-9 focus-visible:ring-red-500/50"
          />
        </ControlGroup>

        <ControlGroup label="Glitch Intensity">
          <Slider
            value={[settings.amount]}
            min={0}
            max={0.5}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('amount', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="RGB Split">
          <Slider
            value={[settings.rgbSplit]}
            min={0}
            max={0.1}
            step={0.001}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('rgbSplit', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Distortion X">
          <Slider
            value={[settings.distortionX]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('distortionX', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Distortion Y">
          <Slider
            value={[settings.distortionY]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('distortionY', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Analog Noise">
          <Slider
            value={[settings.noiseAmount]}
            min={0}
            max={0.5}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('noiseAmount', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Scanlines">
          <Slider
            value={[settings.scanlines]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('scanlines', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Flicker">
          <Slider
            value={[settings.flicker]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('flicker', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Freeze Frame">
          <Slider
            value={[settings.freeze]}
            min={0}
            max={0.99}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('freeze', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Red Tint">
          <Slider
            value={[settings.redTint]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('redTint', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Red Glare Intensity">
          <Slider
            value={[settings.glareIntensity]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('glareIntensity', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Flash Frequency">
          <Slider
            value={[settings.flashFrequency]}
            min={0.1}
            max={10}
            step={0.1}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('flashFrequency', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <ControlGroup label="Text Sync Degree">
          <Slider
            value={[settings.syncDegree]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              updateSetting('syncDegree', val);
            }}
            className="py-4"
          />
        </ControlGroup>

        <div className="h-[1px] w-full bg-white/10 my-4" />

        <div className="flex items-center justify-between mb-2">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-white/30">Silhouette Mode</Label>
          <Switch 
            checked={settings.silhouetteMode}
            onCheckedChange={(checked) => setSettings({ ...settings, silhouetteMode: checked })}
          />
        </div>

        {settings.silhouetteMode && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <ControlGroup label="Silhouette Color">
              <div className="flex gap-2">
                {['#ff0000', '#880000', '#ffffff', '#ff4444'].map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border border-white/20 ${settings.silhouetteColor === color ? 'ring-2 ring-white/50' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSettings({ ...settings, silhouetteColor: color })}
                  />
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Glow Intensity">
              <Slider
                value={[settings.glowIntensity]}
                min={0}
                max={2}
                step={0.01}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  updateSetting('glowIntensity', val);
                }}
                className="py-4"
              />
            </ControlGroup>

            <ControlGroup label="Trail Length">
              <Slider
                value={[settings.trailLength]}
                min={0}
                max={0.99}
                step={0.01}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  updateSetting('trailLength', val);
                }}
                className="py-4"
              />
            </ControlGroup>

            <ControlGroup label="Trail Style">
              <div className="flex gap-2">
                {['Smooth', 'Sharp', 'Glitch'].map((style, i) => (
                  <button
                    key={style}
                    className={`flex-1 py-1 text-[8px] font-mono uppercase border border-white/10 rounded ${settings.trailStyle === i ? 'bg-white/20 text-white' : 'text-white/30 hover:bg-white/5'}`}
                    onClick={() => updateSetting('trailStyle', i)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Contour Sharpness">
              <Slider
                value={[settings.contourSharpness]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  updateSetting('contourSharpness', val);
                }}
                className="py-4"
              />
            </ControlGroup>

            <ControlGroup label="Contour Thickness">
              <Slider
                value={[settings.contourThickness]}
                min={0.5}
                max={5}
                step={0.1}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  updateSetting('contourThickness', val);
                }}
                className="py-4"
              />
            </ControlGroup>

            <ControlGroup label="Face Detail Intensity">
              <Slider
                value={[settings.faceDetailIntensity]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  updateSetting('faceDetailIntensity', val);
                }}
                className="py-4"
              />
            </ControlGroup>

            <ControlGroup label="Subtle Edge Glitch">
              <Slider
                value={[settings.subtleGlitchAmount]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  updateSetting('subtleGlitchAmount', val);
                }}
                className="py-4"
              />
            </ControlGroup>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-3">
        <Button 
          onClick={onCapture}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-mono text-[10px] uppercase tracking-widest"
        >
          <Camera className="mr-2 h-4 w-4" /> Capture Frame
        </Button>
        <Button 
          onClick={onToggleRecording}
          variant={isRecording ? "destructive" : "default"}
          className={`w-full font-mono text-[10px] uppercase tracking-widest ${!isRecording ? 'bg-red-900/40 hover:bg-red-900/60 border border-red-500/30' : ''}`}
        >
          {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>
    </div>
  );
};

const ControlGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-mono uppercase tracking-wider text-white/30">{label}</Label>
    {children}
  </div>
);
