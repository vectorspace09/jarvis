"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { Settings2, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Slider } from '../ui/slider'
import { useVoiceStore } from '@/store/voice-store'
import { VOICE_PRESETS } from '@/lib/voice-presets'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export function VoiceSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    voice, style, emotion, speed,
    volume, pitch, stability, clarity,
    isMuted, activePreset,
    setVoice, setStyle, setEmotion, setSpeed,
    setVolume, setPitch, setStability, setClarity,
    toggleMute, applyPreset, resetToDefault
  } = useVoiceStore()

  const handlePresetClick = (presetKey: string) => {
    applyPreset(presetKey)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <div className="flex items-center justify-between p-2">
            <DropdownMenuLabel>
              Voice Settings
              {activePreset && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({VOICE_PRESETS[activePreset].name})
                </span>
              )}
            </DropdownMenuLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetToDefault}
              title="Reset to default"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenuSeparator />

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="p-2 space-y-2">
              {Object.entries(VOICE_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant={activePreset === key ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start flex-col items-start h-auto p-4 space-y-1",
                    activePreset === key ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                  onClick={() => handlePresetClick(key)}
                >
                  <span className="font-medium flex items-center gap-2">
                    {preset.name}
                    {activePreset === key && (
                      <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </span>
                  <span className={cn(
                    "text-xs normal-case font-normal",
                    activePreset === key ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {preset.description}
                  </span>
                </Button>
              ))}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 p-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as any)}
                >
                  <option value="female">Female (Rachel)</option>
                  <option value="male">Male (Antoni)</option>
                  <option value="british">British (Harry)</option>
                  <option value="american">American (Josh)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                >
                  <option value="natural">Natural</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="cheerful">Cheerful</option>
                  <option value="serious">Serious</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Emotion</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value as any)}
                >
                  <option value="neutral">Neutral</option>
                  <option value="happy">Happy</option>
                  <option value="sad">Sad</option>
                  <option value="excited">Excited</option>
                  <option value="calm">Calm</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Speed</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value as any)}
                >
                  <option value="very-slow">Very Slow</option>
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                  <option value="very-fast">Very Fast</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Volume</label>
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setVolume(value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pitch</label>
                <Slider
                  value={[pitch * 100]}
                  min={50}
                  max={150}
                  step={1}
                  onValueChange={([value]) => setPitch(value / 100)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stability</label>
                <Slider
                  value={[stability * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setStability(value / 100)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Clarity</label>
                <Slider
                  value={[clarity * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setClarity(value / 100)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 