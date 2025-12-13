'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Search, 
  Moon, 
  Sun, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Edit3,
  Trash2,
  MoreVertical,
  Send,
  Bot,
  User,
  Sliders,
  Save,
  Heart,
  Sparkles,
  Brain,
  Smile,
  Target,
  Leaf,
  Star
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date | string
  isStreaming?: boolean
  reactions?: { emoji: string; count: number; userReacted?: boolean }[]
  isBookmarked?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date | string
  updatedAt: Date | string
  isPinned?: boolean
}

interface AISettings {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

interface AssistantMode {
  id: string
  name: string
  icon: any
  color: string
  systemPrompt: string
  description: string
  animation?: string
}

interface UserMood {
  emoji: string
  label: string
  responses: string[]
  color: string
}

interface DailyChallenge {
  id: string
  title: string
  description: string
  type: 'mindfulness' | 'productivity' | 'creativity' | 'wellness'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  icon: string
}

interface UserProfile {
  name: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    voiceEnabled: boolean
    soundEnabled: boolean
    autoMoodCheck: boolean
    notifications: boolean
  }
  stats: {
    totalMessages: number
    totalConversations: number
    challengesCompleted: number
    currentStreak: number
    longestStreak: number
    favoriteMode: string
    moodHistory: { mood: string; timestamp: Date | string; response?: string }[]
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Welcome to AI Assistant',
      messages: [
        {
          id: '1',
          content: 'Hello! I\'m your AI assistant. How can I help you today?',
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          reactions: [],
          isBookmarked: false
        }
      ],
      createdAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString()
    }
  ])
  const [activeConversationId, setActiveConversationId] = useState('1')
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [synthesis, setSynthesis] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a helpful AI assistant. Be concise and helpful in your responses.'
  })
  const [currentMode, setCurrentMode] = useState<string>('default')
  const [isMoodCheckOpen, setIsMoodCheckOpen] = useState(false)
  const [showVisualFeedback, setShowVisualFeedback] = useState<{type: string, message: string} | null>(null)
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [zenModeActive, setZenModeActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const { theme, setTheme } = useTheme()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Utility function to format timestamps consistently
  const formatTimestamp = (timestamp: Date | string) => {
    if (typeof timestamp === 'string') {
      return timestamp
    }
    return timestamp.toLocaleTimeString()
  }

  // Assistant modes configuration
  const assistantModes: AssistantMode[] = [
    {
      id: 'default',
      name: 'Default',
      icon: Bot,
      color: 'text-blue-500',
      systemPrompt: 'You are a helpful AI assistant. Be concise and helpful in your responses.',
      description: 'Standard helpful assistant',
      animation: 'bounce'
    },
    {
      id: 'chill',
      name: 'Chill Vibes',
      icon: Leaf,
      color: 'text-green-500',
      systemPrompt: 'You are a super relaxed, chill AI assistant. Use calm, soothing language. Speak slowly and peacefully. Use words like "hey", "cool", "awesome", "chill", "vibes", "relax", "breathe". Be super supportive and mellow. Respond in a very laid-back, friendly tone.',
      description: 'Relaxed and soothing responses',
      animation: 'pulse'
    },
    {
      id: 'playful',
      name: 'Playful',
      icon: Smile,
      color: 'text-pink-500',
      systemPrompt: 'You are a fun, playful, and slightly flirty AI assistant. Use emojis, playful language, and light humor. Be charming and witty, but keep it appropriate and fun. Use phrases like "hey there gorgeous", "you\'re amazing", "I love talking to you". Be confident but sweet.',
      description: 'Fun and lighthearted interactions',
      animation: 'bounce'
    },
    {
      id: 'confidence',
      name: 'Confidence Boost',
      icon: Target,
      color: 'text-orange-500',
      systemPrompt: 'You are an incredibly motivating and confidence-boosting AI assistant. Always uplift the user, celebrate their achievements, and encourage them to believe in themselves. Use powerful, positive language. Tell them they\'re capable, strong, and amazing. Be their personal cheerleader!',
      description: 'Motivating and confidence-building',
      animation: 'bounce'
    },
    {
      id: 'zen',
      name: 'Zen Mode',
      icon: Brain,
      color: 'text-purple-500',
      systemPrompt: 'You are a mindful, zen-like AI assistant. Speak with wisdom and tranquility. Offer mindfulness tips, breathing exercises, and peaceful thoughts. Use calming language and encourage meditation and self-reflection. Be a source of serenity and inner peace.',
      description: 'Mindful and peaceful guidance',
      animation: 'pulse'
    }
  ]

  // Enhanced mood options with colors
  const moodOptions: UserMood[] = [
    { emoji: '😊', label: 'Happy', responses: ["That's wonderful! I'm so glad you're feeling happy!", "Your happiness is contagious! Keep shining!", "Amazing! Let's make today even better!"], color: 'text-yellow-500' },
    { emoji: '😌', label: 'Calm', responses: ["Peaceful vibes! I love that you're feeling centered.", "So serene! Let's maintain this beautiful calm energy.", "Perfect! Let's enjoy this moment of tranquility together."], color: 'text-green-500' },
    { emoji: '😔', label: 'Sad', responses: ["I'm here for you. It's okay to feel sad sometimes.", "Sending you a big virtual hug. You're not alone.", "Your feelings are valid. Let's work through this together."], color: 'text-blue-500' },
    { emoji: '😤', label: 'Frustrated', responses: ["Take a deep breath. We'll figure this out together.", "I understand your frustration. Let's tackle this step by step.", "Hey, it's okay! Let's find a solution and turn this around."], color: 'text-red-500' },
    { emoji: '😴', label: 'Tired', responses: ["Rest is important! Let's take it easy.", "You deserve a break. Let's keep things light and relaxing.", "Time to recharge! I'm here for a chill conversation."], color: 'text-purple-500' },
    { emoji: '🤔', label: 'Thoughtful', responses: ["Deep thoughts! I love when you're in this reflective mood.", "Your mind is working in amazing ways!", "Let's explore these thoughts together."], color: 'text-indigo-500' },
    { emoji: '😎', label: 'Confident', responses: ["Love that confidence! You're absolutely crushing it!", "You're unstoppable! Keep that amazing energy!", "Yes! That's the spirit! You've got this!"], color: 'text-orange-500' }
  ]

  // Enhanced daily challenges with difficulty and points
  const dailyChallenges: DailyChallenge[] = [
    { id: '1', title: '3 Deep Breaths', description: 'Take 3 deep, mindful breaths and focus on each inhale and exhale.', type: 'mindfulness', difficulty: 'easy', points: 10, icon: '🫁' },
    { id: '2', title: 'Gratitude List', description: 'Write down 3 things you\'re grateful for right now.', type: 'wellness', difficulty: 'easy', points: 15, icon: '🙏' },
    { id: '3', title: '5-Minute Stretch', description: 'Do a 5-minute stretching routine to energize your body.', type: 'wellness', difficulty: 'medium', points: 20, icon: '🤸' },
    { id: '4', title: 'Creative Break', description: 'Doodle, write, or create something for 10 minutes without judgment.', type: 'creativity', difficulty: 'medium', points: 25, icon: '🎨' },
    { id: '5', title: 'Power Pose', description: 'Stand in a power pose for 2 minutes and feel your confidence grow.', type: 'productivity', difficulty: 'easy', points: 15, icon: '💪' },
    { id: '6', title: 'Mindful Walking', description: 'Take a short walk and notice 5 things you\'ve never seen before.', type: 'mindfulness', difficulty: 'medium', points: 20, icon: '🚶' },
    { id: '7', title: 'Digital Detox', description: 'Spend 30 minutes without any digital devices.', type: 'wellness', difficulty: 'hard', points: 30, icon: '📵' },
    { id: '8', title: 'Random Act of Kindness', description: 'Do something kind for someone without expecting anything in return.', type: 'wellness', difficulty: 'medium', points: 25, icon: '❤️' }
  ]

  // Time-based mood questions
  const getTimeBasedQuestion = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return "Good morning! How are you feeling today? What's on your mind for the day ahead? 🌅"
    } else if (hour < 17) {
      return "Good afternoon! How's your day going so far? Anything exciting happening? ☀️"
    } else if (hour < 22) {
      return "Good evening! How was your day? Ready to unwind and relax? 🌙"
    } else {
      return "Good night! How are you feeling as the day comes to an end? 🌟"
    }
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeConversation?.messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeConversationId])

  useEffect(() => {
    setMounted(true)
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }
      
      // Ctrl/Cmd + N for new conversation
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        handleNewConversation()
      }
      
      // Ctrl/Cmd + / for mood check
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setIsMoodCheckOpen(true)
      }
      
      // Escape to close dialogs
      if (event.key === 'Escape') {
        setIsMoodCheckOpen(false)
        setIsSettingsOpen(false)
        setShowReactions(null)
      }
      
      // Enter to send message (without Shift)
      if (event.key === 'Enter' && !event.shiftKey && !isTyping) {
        const activeElement = document.activeElement
        if (activeElement === inputRef.current) {
          event.preventDefault()
          handleSendMessage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTyping, inputMessage])

  // Debounced localStorage update function
  const debounceLocalStorageUpdate = useCallback((key: string, value: any, delay: number = 1000) => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value))
    }, delay)
    
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    // Update user profile favorite mode based on usage
    if (userProfile && currentMode !== userProfile.stats.favoriteMode) {
      const modeUsage = parseInt(localStorage.getItem(`modeUsage_${currentMode}`) || '0')
      localStorage.setItem(`modeUsage_${currentMode}`, (modeUsage + 1).toString())
      
      // Update favorite mode if this mode is used more
      const currentFavoriteUsage = parseInt(localStorage.getItem(`modeUsage_${userProfile.stats.favoriteMode}`) || '0')
      if (modeUsage + 1 > currentFavoriteUsage) {
        const updatedProfile = {
          ...userProfile,
          stats: {
            ...userProfile.stats,
            favoriteMode: currentMode
          }
        }
        setUserProfile(updatedProfile)
        debounceLocalStorageUpdate('userProfile', updatedProfile, 500)
      }
    }
  }, [currentMode, userProfile, debounceLocalStorageUpdate])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load user profile
        const savedProfile = localStorage.getItem('userProfile')
        let profile: UserProfile
        
        if (savedProfile) {
          try {
            profile = JSON.parse(savedProfile)
          } catch (error) {
            // Silently handle user profile parsing errors
            console.debug('Failed to parse user profile:', error)
            profile = createDefaultProfile()
          }
        } else {
          profile = createDefaultProfile()
        }
        
        setUserProfile(profile)

        // Load AI settings
        const savedSettings = localStorage.getItem('aiSettings')
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings)
            setAiSettings(parsed)
          } catch (error) {
            // Silently handle AI settings loading errors
            console.debug('Failed to load AI settings:', error)
          }
        }

        // Load saved mode
        const savedMode = localStorage.getItem('assistantMode')
        if (savedMode) {
          setCurrentMode(savedMode)
        }

        // Load completed challenges
        const savedCompletedChallenges = localStorage.getItem('completedChallenges')
        if (savedCompletedChallenges) {
          try {
            setCompletedChallenges(JSON.parse(savedCompletedChallenges))
          } catch (error) {
            // Silently handle completed challenges loading errors
            console.debug('Failed to load completed challenges:', error)
          }
        }

        // Initialize speech recognition
        if (typeof window !== 'undefined') {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition()
            recognitionInstance.continuous = false
            recognitionInstance.interimResults = true
            recognitionInstance.lang = 'en-US'

            recognitionInstance.onresult = (event: any) => {
              const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('')
              setInputMessage(transcript)
            }

            recognitionInstance.onerror = (event: any) => {
              // Handle speech recognition errors gracefully
              console.debug('Speech recognition error:', event.error)
              setIsListening(false)
              setError('Speech recognition error. Please try again.')
            }

            recognitionInstance.onend = () => {
              setIsListening(false)
            }

            setRecognition(recognitionInstance)
          }

          // Initialize speech synthesis
          const speechSynthesis = window.speechSynthesis
          setSynthesis(speechSynthesis)
        }

        // Set daily challenge
        const today = new Date().toDateString()
        const savedChallengeDate = localStorage.getItem('dailyChallengeDate')
        if (savedChallengeDate !== today) {
          const randomChallenge = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)]
          setDailyChallenge(randomChallenge || null)
          localStorage.setItem('dailyChallenge', JSON.stringify(randomChallenge))
          localStorage.setItem('dailyChallengeDate', today)
        } else {
          const savedChallenge = localStorage.getItem('dailyChallenge')
          if (savedChallenge) {
            try {
              setDailyChallenge(JSON.parse(savedChallenge) as DailyChallenge)
            } catch (error) {
              // Silently handle daily challenge loading errors
              console.debug('Failed to load daily challenge:', error)
            }
          }
        }

        // Show time-based mood question occasionally if enabled
        if (profile.preferences.autoMoodCheck) {
          const lastMoodCheck = localStorage.getItem('lastMoodCheck')
          const now = new Date().getTime()
          if (!lastMoodCheck || now - parseInt(lastMoodCheck) > 4 * 60 * 60 * 1000) { // 4 hours
            setTimeout(() => {
              setIsMoodCheckOpen(true)
              localStorage.setItem('lastMoodCheck', now.toString())
            }, 3000) // Show after 3 seconds
          }
        }

      } catch (error) {
        // Log initialization errors for debugging
        console.debug('Failed to initialize app:', error)
        setError('Failed to initialize app. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      initializeApp()
    }
  }, [mounted])

  const createDefaultProfile = (): UserProfile => {
    return {
      name: 'User',
      preferences: {
        theme: 'system',
        voiceEnabled: true,
        soundEnabled: true,
        autoMoodCheck: true,
        notifications: true
      },
      stats: {
        totalMessages: 0,
        totalConversations: 1,
        challengesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteMode: 'default',
        moodHistory: []
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
      reactions: [],
      isBookmarked: false
    }

    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: new Date().toLocaleTimeString()
          }
        : conv
    ))

    // Update user stats
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        stats: {
          ...userProfile.stats,
          totalMessages: userProfile.stats.totalMessages + 1
        }
      }
      setUserProfile(updatedProfile)
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
    }

    setInputMessage('')
    setIsTyping(true)
    setError(null)

    try {
      // Get conversation history
      const conversationHistory = activeConversation?.messages || []
      const messagesToSend = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: inputMessage
        }
      ]

      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
          model: aiSettings.model,
          temperature: aiSettings.temperature,
          maxTokens: aiSettings.maxTokens,
          systemPrompt: assistantModes.find(m => m.id === currentMode)?.systemPrompt || aiSettings.systemPrompt
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response to conversation
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || 'Sorry, I received an empty response.',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        reactions: [],
        isBookmarked: false
      }

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? {
              ...conv,
              messages: [...conv.messages, aiMessage],
              updatedAt: new Date().toLocaleTimeString()
            }
          : conv
      ))

      // Update user stats
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          stats: {
            ...userProfile.stats,
            totalMessages: userProfile.stats.totalMessages + 1
          }
        }
        setUserProfile(updatedProfile)
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
      }

      setIsTyping(false)

    } catch (error) {
      // Log message sending errors for debugging
      console.debug('Error sending message:', error)
      setIsTyping(false)
      setError(error instanceof Error ? error.message : 'Failed to send message')
      
      // Add error message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? {
              ...conv,
              messages: [...conv.messages, {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant' as const,
                timestamp: new Date().toLocaleTimeString(),
                reactions: [],
                isBookmarked: false
              }],
              updatedAt: new Date().toLocaleTimeString()
            }
          : conv
      ))
    }
  }

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString()
    }
    setConversations(prev => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
  }

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id))
    if (id === activeConversationId && conversations.length > 1) {
      const newConversations = conversations.filter(conv => conv.id !== id);
      if (newConversations.length > 0) {
        if (newConversations.length > 0 && newConversations[0]) {
          setActiveConversationId(newConversations[0].id);
        }
      }
    }
  }

  const handleEditConversation = (id: string, currentTitle: string) => {
    setEditingConversationId(id)
    setEditingTitle(currentTitle)
  }

  const handleSaveEdit = () => {
    if (editingConversationId && editingTitle.trim()) {
      setConversations(prev => prev.map(conv => 
        conv.id === editingConversationId 
          ? { ...conv, title: editingTitle.trim() }
          : conv
      ))
      setEditingConversationId(null)
      setEditingTitle('')
    }
  }

  const handleCancelEdit = () => {
    setEditingConversationId(null)
    setEditingTitle('')
  }

  const handleSaveAISettings = () => {
    // Save settings to localStorage or state management
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings))
    setIsSettingsOpen(false)
  }

  const handleResetAISettings = () => {
    setAiSettings({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: 'You are a helpful AI assistant. Be concise and helpful in your responses.'
    })
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const speakText = (text: string) => {
    if (!synthesis || !isSoundEnabled) return

    // Cancel any ongoing speech
    synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    synthesis.speak(utterance)
  }

  const handleModeChange = (modeId: string) => {
    setCurrentMode(modeId)
    localStorage.setItem('assistantMode', modeId)
    
    const mode = assistantModes.find(m => m.id === modeId)
    if (mode) {
      setShowVisualFeedback({
        type: 'mode',
        message: `Switched to ${mode.name} mode! ${mode.description}`
      })
      setTimeout(() => setShowVisualFeedback(null), 3000)
    }
  }

  const handleMoodSelect = (mood: UserMood) => {
    setIsMoodCheckOpen(false)
    
    const randomResponse = mood.responses.length > 0 ? mood.responses[Math.floor(Math.random() * mood.responses.length)] : "Thanks for sharing your mood!"
    
    // Add mood response to conversation
    const moodMessage: Message = {
      id: Date.now().toString(),
      content: randomResponse as string,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      reactions: [],
      isBookmarked: false
    }

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? {
            ...conv,
            messages: [...conv.messages, moodMessage],
            updatedAt: new Date().toLocaleTimeString()
          }
        : conv
    ))

    // Update user profile with mood history
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        stats: {
          ...userProfile.stats,
          moodHistory: [
            ...userProfile.stats.moodHistory,
            {
              mood: mood.label,
              timestamp: new Date().toLocaleTimeString(),
              response: randomResponse
            }
          ]
        }
      }
      setUserProfile(updatedProfile)
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
    }

    setShowVisualFeedback({
      type: 'mood',
      message: `Mood noted: ${mood.emoji} ${mood.label}`
    })
    setTimeout(() => setShowVisualFeedback(null), 3000)
  }

  const handleZenModeToggle = () => {
    setZenModeActive(!zenModeActive)
    if (!zenModeActive) {
      handleModeChange('zen')
      setShowVisualFeedback({
        type: 'zen',
        message: 'Zen Mode activated! Find your inner peace 🧘‍♀️'
      })
    } else {
      handleModeChange('default')
      setShowVisualFeedback({
        type: 'zen',
        message: 'Zen Mode deactivated'
      })
    }
    setTimeout(() => setShowVisualFeedback(null), 3000)
  }

  const handleCompleteChallenge = () => {
    if (dailyChallenge && !completedChallenges.includes(dailyChallenge.id)) {
      const newCompletedChallenges = [...completedChallenges, dailyChallenge.id]
      setCompletedChallenges(newCompletedChallenges)
      localStorage.setItem('completedChallenges', JSON.stringify(newCompletedChallenges))

      setShowVisualFeedback({
        type: 'challenge',
        message: `Challenge completed! +${dailyChallenge.points} points 🎉`
      })
      setTimeout(() => setShowVisualFeedback(null), 3000)
      
      // Add completion message to conversation
      const completionMessage: Message = {
        id: Date.now().toString(),
        content: `Congratulations on completing your daily challenge: "${dailyChallenge.title}"! You earned ${dailyChallenge.points} points. You're doing great! 🌟`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        reactions: [],
        isBookmarked: false
      }

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? {
              ...conv,
              messages: [...conv.messages, completionMessage],
              updatedAt: new Date().toLocaleTimeString()
            }
          : conv
      ))

      // Update user stats
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          stats: {
            ...userProfile.stats,
            challengesCompleted: userProfile.stats.challengesCompleted + 1,
            currentStreak: userProfile.stats.currentStreak + 1,
            longestStreak: Math.max(userProfile.stats.longestStreak, userProfile.stats.currentStreak + 1)
          }
        }
        setUserProfile(updatedProfile)
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
      }
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId 
                ? {
                    ...msg,
                    reactions: msg.reactions || [],
                    isBookmarked: msg.isBookmarked || false
                  }
                : msg
            ).map(msg => 
              msg.id === messageId 
                ? {
                    ...msg,
                    reactions: msg.reactions ? 
                      msg.reactions.some(r => r.emoji === emoji)
                        ? msg.reactions.map(r => 
                            r.emoji === emoji 
                              ? { ...r, count: r.count + 1, userReacted: true }
                              : r
                          )
                        : [...msg.reactions, { emoji, count: 1, userReacted: true }]
                      : [{ emoji, count: 1, userReacted: true }]
                  }
                : msg
            )
          }
        : conv
    ))
    setShowReactions(null)
  }

  const handleBookmark = (messageId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId 
                ? { ...msg, isBookmarked: !msg.isBookmarked, reactions: msg.reactions || [] }
                : msg
            )
          }
        : conv
    ))
  }

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-lg font-medium">Loading AI Assistant...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-destructive-foreground hover:text-destructive-foreground/80"
              onClick={() => setError(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Visual Feedback Overlay */}
      {showVisualFeedback && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black/80 text-white px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              {showVisualFeedback.type === 'mode' && <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />}
              {showVisualFeedback.type === 'mood' && <Heart className="w-6 h-6 text-pink-400 animate-pulse" />}
              {showVisualFeedback.type === 'zen' && <Brain className="w-6 h-6 text-purple-400 animate-pulse" />}
              {showVisualFeedback.type === 'challenge' && <Star className="w-6 h-6 text-orange-400 animate-bounce" />}
              <span className="text-lg font-medium">{showVisualFeedback.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className="fixed z-50 bg-background border rounded-lg shadow-lg p-2">
          <div className="flex gap-1">
            {['❤️', '👍', '😊', '🎉', '🔥', '💯'].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="text-xl hover:bg-accent"
                onClick={() => handleReaction(showReactions, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mood Check Dialog */}
      <Dialog open={isMoodCheckOpen} onOpenChange={setIsMoodCheckOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
              How are you feeling?
            </DialogTitle>
            <DialogDescription>
              {getTimeBasedQuestion()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-4">
            {moodOptions.map((mood) => (
              <Button
                key={mood.label}
                variant="outline"
                className={`flex flex-col items-center gap-2 h-20 p-3 hover:${mood.color} hover:text-white transition-colors`}
                onClick={() => handleMoodSelect(mood)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setIsMoodCheckOpen(false)}>
              Maybe later
            </Button>
            <div className="text-xs text-muted-foreground">
              Press Ctrl+/ anytime to check your mood
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <div className="w-80 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Assistant
            </h1>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    >
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sliders className="w-5 h-5" />
                            AI Settings
                          </DialogTitle>
                          <DialogDescription>
                            Configure the AI behavior and response settings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="model">AI Model</Label>
                            <Select value={aiSettings.model} onValueChange={(value) => setAiSettings(prev => ({ ...prev, model: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature: {aiSettings.temperature}</Label>
                            <Slider
                              value={[aiSettings.temperature]}
                              onValueChange={(value) => setAiSettings(prev => {
                                const newValue = value[0];
                                if (newValue === undefined) return prev;
                                return { ...prev, temperature: newValue };
                              })}
                              max={2}
                              min={0}
                              step={0.1}
                              className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">
                              Controls randomness: Lower values make responses more focused, higher values more creative
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maxTokens">Max Tokens: {aiSettings.maxTokens}</Label>
                            <Slider
                              value={[aiSettings.maxTokens]}
                              onValueChange={(value) => setAiSettings(prev => {
                                const newValue = value[0];
                                if (newValue === undefined) return prev;
                                return { ...prev, maxTokens: newValue };
                              })}
                              max={4000}
                              min={100}
                              step={100}
                              className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">
                              Maximum length of the response in tokens
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="systemPrompt">System Prompt</Label>
                            <Textarea
                              id="systemPrompt"
                              value={aiSettings.systemPrompt}
                              onChange={(e) => setAiSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                              placeholder="Enter system prompt to guide AI behavior..."
                              rows={4}
                            />
                            <p className="text-sm text-muted-foreground">
                              Instructions that guide the AI's behavior and responses
                            </p>
                          </div>

                          <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={handleResetAISettings}>
                              Reset to Defaults
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveAISettings}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <Button onClick={handleNewConversation} className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            New Conversation
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="p-4 border-b">
          <Label className="text-sm font-medium mb-2 block">Assistant Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {assistantModes.map((mode) => (
              <Button
                key={mode.id}
                variant={currentMode === mode.id ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => handleModeChange(mode.id)}
              >
                <mode.icon className={`w-4 h-4 ${mode.color}`} />
                <span className="text-xs">{mode.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="p-4 border-b">
            <Card className={`bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 ${completedChallenges.includes(dailyChallenge.id) ? 'opacity-75' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{dailyChallenge.icon}</span>
                      <span className="text-sm font-medium">Daily Challenge</span>
                      <Badge variant="secondary" className="text-xs">
                        {dailyChallenge.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{dailyChallenge.points}pts
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{dailyChallenge.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{dailyChallenge.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dailyChallenge.type}
                      </Badge>
                      {completedChallenges.includes(dailyChallenge.id) && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          Completed ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!completedChallenges.includes(dailyChallenge.id) && (
                    <Button size="sm" onClick={handleCompleteChallenge}>
                      Done!
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Stats */}
        {userProfile && (
          <div className="p-4 border-b">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Your Progress</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="font-medium">{userProfile.stats.totalMessages}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Challenges:</span>
                    <span className="font-medium">{userProfile.stats.challengesCompleted}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Streak:</span>
                    <span className="font-medium">{userProfile.stats.currentStreak}🔥</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Favorite:</span>
                    <span className="font-medium">
                      {assistantModes.find(m => m.id === userProfile.stats.favoriteMode)?.name || 'Default'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-colors ${
                  conversation.id === activeConversationId ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  if (!editingConversationId) {
                    setActiveConversationId(conversation.id)
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingConversationId === conversation.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit()
                              } else if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium truncate">{conversation.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(conversation.updatedAt)}
                          </p>
                        </>
                      )}
                    </div>
                    {editingConversationId !== conversation.id && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditConversation(conversation.id, conversation.title)
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteConversation(conversation.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{activeConversation?.title}</h2>
              <p className="text-sm text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMoodCheckOpen(true)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Check your mood</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZenModeToggle}
                    className={zenModeActive ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' : ''}
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{zenModeActive ? 'Exit Zen Mode' : 'Enter Zen Mode'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  >
                    {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isVoiceEnabled ? 'Disable voice features' : 'Enable voice features'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceInput}
                    disabled={!isVoiceEnabled}
                    className={isListening ? 'bg-red-100 text-red-600' : ''}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? 'Stop listening' : 'Start voice input'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  >
                    {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSoundEnabled ? 'Disable sound' : 'Enable sound'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {activeConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {currentMode === 'chill' && <Leaf className="w-4 h-4" />}
                        {currentMode === 'playful' && <Smile className="w-4 h-4" />}
                        {currentMode === 'confidence' && <Target className="w-4 h-4" />}
                        {currentMode === 'zen' && <Brain className="w-4 h-4" />}
                        {currentMode === 'default' && <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    {currentMode !== 'default' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center">
                        {currentMode === 'chill' && <span className="text-xs">🌿</span>}
                        {currentMode === 'playful' && <span className="text-xs">✨</span>}
                        {currentMode === 'confidence' && <span className="text-xs">🔥</span>}
                        {currentMode === 'zen' && <span className="text-xs">🧘</span>}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 relative ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap flex-1">{message.content}</p>
                    <div className="flex flex-col gap-1">
                      {message.role === 'assistant' && message.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 flex-shrink-0"
                          onClick={() => speakText(message.content)}
                          disabled={!isSoundEnabled}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 flex-shrink-0"
                        onClick={() => handleBookmark(message.id)}
                      >
                        {message.isBookmarked ? <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> : <Star className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </p>
                    <div className="flex items-center gap-1">
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1">
                          {message.reactions.map((reaction, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs ${
                                reaction.userReacted 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowReactions(showReactions === message.id ? null : message.id)
                          }}
                        >
                          <span className="text-lg">😊</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Add cute animations based on mode */}
                  {message.role === 'assistant' && currentMode === 'playful' && (
                    <div className="absolute -top-2 -right-2 animate-bounce">
                      <span className="text-lg">💕</span>
                    </div>
                  )}
                  {message.role === 'assistant' && currentMode === 'chill' && (
                    <div className="absolute -top-2 -right-2 animate-pulse">
                      <span className="text-lg">🌸</span>
                    </div>
                  )}
                  {message.role === 'assistant' && currentMode === 'confidence' && (
                    <div className="absolute -top-2 -right-2 animate-bounce">
                      <span className="text-lg">⭐</span>
                    </div>
                  )}
                  {message.role === 'assistant' && currentMode === 'zen' && (
                    <div className="absolute -top-2 -right-2 animate-pulse">
                      <span className="text-lg">🕊️</span>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {currentMode === 'chill' && <Leaf className="w-4 h-4" />}
                    {currentMode === 'playful' && <Smile className="w-4 h-4" />}
                    {currentMode === 'confidence' && <Target className="w-4 h-4" />}
                    {currentMode === 'zen' && <Brain className="w-4 h-4" />}
                    {currentMode === 'default' && <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-2">
              <div className="text-xs text-muted-foreground flex items-center gap-4">
                <span>Ctrl/Cmd+K - Search</span>
                <span>Ctrl/Cmd+N - New Chat</span>
                <span>Ctrl/Cmd+/ - Mood Check</span>
                <span>Enter - Send</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}