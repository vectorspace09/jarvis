'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/hooks/use-theme'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface UserPreferences {
  theme: 'system' | 'light' | 'dark'
  notifications: boolean
  language: string
}

interface ProfileFormProps {
  user: User
  profile: {
    name?: string
    preferences?: UserPreferences
  }
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [preferences, setPreferences] = useState<UserPreferences>(profile?.preferences || {
    theme: 'system',
    notifications: true,
    language: 'en',
  })

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name,
          email: user.email,
          preferences,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setTheme(preferences.theme)
      
      toast.success('Profile updated!')
      router.refresh()
    } catch (error) {
      toast.error('Error updating profile')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as UserPreferences['theme']
    setPreferences((prev: UserPreferences) => ({ ...prev, theme: newTheme }))
    setTheme(newTheme)
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences((prev: UserPreferences) => ({ 
      ...prev, 
      language: e.target.value 
    }))
  }

  const handleNotificationChange = (checked: boolean) => {
    setPreferences((prev: UserPreferences) => ({ 
      ...prev, 
      notifications: checked 
    }))
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{name || 'Set your name'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="voice">Voice Settings</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your basic profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your app experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={preferences.theme}
                  onChange={handleThemeChange}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={preferences.language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about updates and reminders
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={handleNotificationChange}
                />
              </div>

              <Button 
                onClick={updateProfile} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Settings */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>
                Customize Jarvis's voice and speech patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Voice settings will be implemented later */}
              <p className="text-muted-foreground">Voice customization coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 