import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Radio, Volume2, VolumeX } from 'lucide-react';
import { synthInstance, SynthPreset } from '../utils/audioSynth';

interface AmbientPlayerProps {
  defaultPreset?: 'zen' | 'space' | 'warm';
  autoplay?: boolean;
}

export default function AmbientPlayer({ defaultPreset = 'zen', autoplay = false }: AmbientPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<SynthPreset>(defaultPreset);
  const [volume, setVolume] = useState(0.20);
  const [isMuted, setIsMuted] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const userInteractedRef = useRef(false);

  // Sync state with parent's preferred soundtrack preset
  useEffect(() => {
    if (defaultPreset) {
      setCurrentPreset(defaultPreset);
      if (synthInstance.getIsRunning()) {
        synthInstance.changePreset(defaultPreset);
      }
    }
  }, [defaultPreset]);

  // Synchronize player running state
  useEffect(() => {
    setIsPlaying(synthInstance.getIsRunning());
  }, []);

  // Autoplay Logic with Browser Compliance
  useEffect(() => {
    if (!autoplay) return;

    const tryAutoplay = () => {
      if (userInteractedRef.current || synthInstance.getIsRunning()) return;
      
      userInteractedRef.current = true;
      synthInstance.start(defaultPreset);
      synthInstance.setVolume(isMuted ? 0 : volume);
      setIsPlaying(true);

      // Clean up event listeners after the first successful trigger
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', tryAutoplay);
      window.removeEventListener('touchstart', tryAutoplay);
      window.removeEventListener('keydown', tryAutoplay);
    };

    // Listen to first click/tap anywhere on the page to trigger audio context smoothly
    window.addEventListener('click', tryAutoplay);
    window.addEventListener('touchstart', tryAutoplay);
    window.addEventListener('keydown', tryAutoplay);

    return () => {
      cleanupListeners();
    };
  }, [autoplay, defaultPreset, isMuted, volume]);

  const handlePlayPause = () => {
    if (isPlaying) {
      synthInstance.stop();
      setIsPlaying(false);
    } else {
      synthInstance.start(currentPreset);
      synthInstance.setVolume(isMuted ? 0 : volume);
      setIsPlaying(true);
    }
  };

  const handlePresetChange = (preset: SynthPreset) => {
    setCurrentPreset(preset);
    synthInstance.changePreset(preset);
    if (!isPlaying) {
      synthInstance.start(preset);
      synthInstance.setVolume(isMuted ? 0 : volume);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    }
    if (isPlaying && !isMuted) {
      synthInstance.setVolume(newVol);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (isPlaying) {
      synthInstance.setVolume(nextMute ? 0 : volume);
    }
  };

  return (
    <div id="ambient-player-container" className="fixed bottom-6 right-6 z-40 max-w-sm w-[calc(100%-3rem)] sm:w-auto">
      <div 
        id="ambient-player-card" 
        className="bg-brand-navy border border-brand-orange/30 rounded-2xl p-4 shadow-2xl text-white transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          {/* Animated visualizer button */}
          <button
            id="ambient-play-button"
            onClick={handlePlayPause}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              isPlaying 
                ? 'bg-brand-orange text-white hover:bg-brand-orange/90 scale-105' 
                : 'bg-brand-navy-dark hover:bg-slate-900 border border-brand-orange/25 text-brand-orange'
            }`}
            aria-label={isPlaying ? "Pause background ambient" : "Play background ambient"}
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5 fill-current animate-pulse" />
            ) : (
              <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Track details & waveform */}
          <div className="flex-1 min-w-[130px]">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                {isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-brand-orange' : 'bg-slate-500'}`}></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Co-fi Ambiance</p>
            </div>
            
            <p className="text-xs font-bold text-slate-100 truncate mt-0.5">
              {synthInstance.getPresetName(currentPreset).split(' (')[0]}
            </p>
            
            {/* Minimal sound wave visualizer bars */}
            <div className="flex items-end gap-[3px] h-2.5 mt-1 overflow-hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => {
                const randomDelay = Math.random() * 0.8;
                const randomDuration = 0.5 + Math.random() * 0.8;
                return (
                  <div
                    key={bar}
                    className={`w-[1.5px] bg-brand-orange/85 rounded-full transition-all`}
                    style={{
                      height: isPlaying ? '100%' : '15%',
                      animation: isPlaying ? `wave 1.1s ease-in-out infinite alternate` : 'none',
                      animationDelay: `${randomDelay}s`,
                      animationDuration: `${randomDuration}s`
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick preset selector toggle */}
          <button
            id="ambient-select-toggle"
            onClick={() => setShowPresets(!showPresets)}
            className={`p-2 rounded-lg transition-colors ${
              showPresets 
                ? 'bg-brand-orange/20 text-brand-orange' 
                : 'text-slate-400 hover:text-white hover:bg-brand-navy-dark'
            }`}
            title="Changer d'ambiance"
          >
            <Radio className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Expandable Controls for Presets & Volume */}
        {showPresets && (
          <div className="mt-3.5 pt-3 border-t border-brand-navy-dark space-y-3 animate-fade-in">
            {/* Presets List */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Choisir le climat sonore</label>
              <div className="grid grid-cols-1 gap-1">
                {(['zen', 'space', 'warm'] as SynthPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between ${
                      currentPreset === preset
                        ? 'bg-brand-orange/15 text-brand-orange font-bold border border-brand-orange/20'
                        : 'text-slate-300 hover:bg-brand-navy-dark hover:text-white border border-transparent'
                    }`}
                  >
                    <span>{synthInstance.getPresetName(preset)}</span>
                    {currentPreset === preset && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume controller */}
            <div className="flex items-center gap-2 pt-1">
              <button 
                id="ambient-mute-button"
                onClick={toggleMute} 
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? "Réactiver le son" : "Couper le son"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                id="ambient-volume-slider"
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-brand-navy-dark rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: scaleY(0.15); }
          100% { transform: scaleY(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
