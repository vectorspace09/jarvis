"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { Settings2, Volume2, VolumeX } from 'lucide-react'
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
import type { VoiceType, VoiceStyle, VoiceSpeed } from '@/types/voice'

export function VoiceSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    voice, 
    style, 
    speed, 
    volume,
    isMuted,
    setVoice,
    setStyle,
    setSpeed,
    setVolume,
    toggleMute
  } = useVoiceStore()

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVoice(e.target.value as VoiceType)
  }

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyle(e.target.value as VoiceStyle)
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(e.target.value as VoiceSpeed)
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
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Voice Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <label className="text-sm font-medium">Voice</label>
            <select
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1"
              value={voice}
              onChange={handleVoiceChange}
            >
              <option value="female">Female (Rachel)</option>
              <option value="male">Male (Antoni)</option>
              <option value="british">British (Harry)</option>
              <option value="american">American (Josh)</option>
            </select>
          </div>

          <div className="p-2">
            <label className="text-sm font-medium">Style</label>
            <select
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1"
              value={style}
              onChange={handleStyleChange}
            >
              <option value="natural">Natural</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div className="p-2">
            <label className="text-sm font-medium">Speed</label>
            <select
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1"
              value={speed}
              onChange={handleSpeedChange}
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div className="p-2">
            <label className="text-sm font-medium">Volume</label>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              className="mt-2"
              onValueChange={(values: number[]) => setVolume(values[0])}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 