"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  Search,
  Smile,
  Clock,
  CheckCheck,
  User,
  MessageCircle,
  Settings,
  Star,
  Shield,
  AlertCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Utility function for className merging
function cnUtil(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Types
interface Message {
  id: string
  content: string
  sender: {
    name: string
    avatar: string
    isAgent?: boolean
  }
  timestamp: string
  status: "sent" | "delivered" | "read"
  type: "text" | "system"
}

interface Customer {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "away" | "offline"
  priority: "high" | "medium" | "low"
  tags: string[]
  lastSeen: string
  ticketNumber: string
}

interface CustomerServiceChatProps {
  customer?: Customer
  onSendMessage?: (message: string) => void
  onCustomerSelect?: (customer: Customer) => void
  className?: string
}

const defaultCustomer: Customer = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  status: "online",
  priority: "high",
  tags: ["Premium", "VIP"],
  lastSeen: "Active now",
  ticketNumber: "CS-2024-001"
}

const sampleCustomers: Customer[] = [
  defaultCustomer,
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "away",
    priority: "medium",
    tags: ["Business"],
    lastSeen: "5 minutes ago",
    ticketNumber: "CS-2024-002"
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    status: "offline",
    priority: "low",
    tags: ["Standard"],
    lastSeen: "2 hours ago",
    ticketNumber: "CS-2024-003"
  }
]

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm having trouble with my recent order. It hasn't arrived yet and it's been 5 days.",
    sender: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    timestamp: "2:30 PM",
    status: "read",
    type: "text"
  },
  {
    id: "2",
    content: "I understand your concern about the delayed order. Let me check the tracking information for you right away.",
    sender: {
      name: "Agent Smith",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isAgent: true
    },
    timestamp: "2:31 PM",
    status: "read",
    type: "text"
  },
  {
    id: "3",
    content: "Thank you! My order number is #ORD-12345",
    sender: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    timestamp: "2:32 PM",
    status: "read",
    type: "text"
  }
]

export function CustomerServiceChat({
  customer = defaultCustomer,
  onSendMessage,
  onCustomerSelect,
  className
}: CustomerServiceChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(customer)
  const [customers] = useState<Customer[]>(sampleCustomers)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: {
        name: "Agent Smith",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isAgent: true
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: "text"
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")
    onSendMessage?.(inputValue)

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate customer response
      const customerResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thank you for your help! That's exactly what I needed.",
        sender: {
          name: selectedCustomer.name,
          avatar: selectedCustomer.avatar
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered",
        type: "text"
      }
      setMessages(prev => [...prev, customerResponse])
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className={cn("flex h-[700px] bg-background border border-border rounded-lg overflow-hidden", className)}>
      {/* Customer Sidebar */}
      <div className="w-80 border-r border-border bg-muted/30">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Customer Queue</h2>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Customer List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {customers.map((cust) => (
              <Card
                key={cust.id}
                className={cn(
                  "mb-2 cursor-pointer transition-colors hover:bg-accent",
                  selectedCustomer.id === cust.id && "bg-accent border-primary"
                )}
                onClick={() => {
                  setSelectedCustomer(cust)
                  onCustomerSelect?.(cust)
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={cust.avatar} alt={cust.name} />
                        <AvatarFallback>{cust.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                        getStatusColor(cust.status)
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{cust.name}</h3>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getPriorityColor(cust.priority))}
                        >
                          {cust.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{cust.email}</p>
                      <p className="text-xs text-muted-foreground">{cust.lastSeen}</p>
                      <div className="flex gap-1 mt-1">
                        {cust.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                  <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                  getStatusColor(selectedCustomer.status)
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{selectedCustomer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedCustomer.ticketNumber}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span>{selectedCustomer.lastSeen}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Info Panel */}
        <div className="p-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Customer since:</span>
              <span className="font-medium">Jan 2023</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Previous tickets:</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Satisfaction:</span>
              <span className="font-medium">4.8/5</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender.isAgent ? "justify-end" : "justify-start"
                )}
              >
                {!message.sender.isAgent && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[70%] space-y-1",
                  message.sender.isAgent && "items-end"
                )}>
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    message.sender.isAgent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    {message.content}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{message.timestamp}</span>
                    {message.sender.isAgent && (
                      <CheckCheck className={cn(
                        "h-3 w-3 ml-1",
                        message.status === "read" ? "text-blue-500" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                </div>
                {message.sender.isAgent && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                  <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
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

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              <span>Response time: 2 min avg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomerServiceChatDemo() {
  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message)
  }

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Customer selected:', customer)
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Customer Service Chat</h1>
          <p className="text-muted-foreground">Professional customer support interface with real-time messaging</p>
        </div>
        <CustomerServiceChat
          onSendMessage={handleSendMessage}
          onCustomerSelect={handleCustomerSelect}
        />
      </div>
    </div>
  )
}
