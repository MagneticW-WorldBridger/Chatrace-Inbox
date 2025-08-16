"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Search,
  User,
  Clock,
  CheckCheck,
  Menu,
  X,
  Settings,
  Star,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Info
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status?: "sent" | "delivered" | "read";
  type?: "text" | "image" | "file";
}

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
  phone?: string;
  location?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

interface Conversation {
  id: string;
  customer: Customer;
  lastMessage: Message;
  unreadCount: number;
  isActive: boolean;
}

const useTextareaResize = (value: string, rows = 1) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textArea = textareaRef.current;

    if (textArea) {
      const computedStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
      const padding =
        parseInt(computedStyle.paddingTop, 10) +
        parseInt(computedStyle.paddingBottom, 10);

      const minHeight = lineHeight * rows + padding;

      textArea.style.height = "0px";
      const scrollHeight = Math.max(textArea.scrollHeight, minHeight);

      textArea.style.height = `${scrollHeight + 2}px`;
    }
  }, [value, rows]);

  return textareaRef;
};

const defaultCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "online",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    tags: ["Premium", "VIP"],
    priority: "high"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "away",
    lastSeen: new Date(Date.now() - 300000),
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    tags: ["Enterprise"],
    priority: "medium"
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000),
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    tags: ["Support"],
    priority: "low"
  },
  {
    id: "4",
    name: "David Rodriguez",
    email: "david.rodriguez@email.com",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    status: "online",
    phone: "+1 (555) 321-0987",
    location: "Austin, TX",
    tags: ["New Customer"],
    priority: "medium"
  }
];

const defaultMessages: Message[] = [
  {
    id: "1",
    content: "Hi there! I'm having trouble with my recent order. Could you help me track it?",
    timestamp: new Date(Date.now() - 1800000),
    isOwn: false
  },
  {
    id: "2",
    content: "Of course! I'd be happy to help you track your order. Could you please provide me with your order number?",
    timestamp: new Date(Date.now() - 1740000),
    isOwn: true,
    status: "read"
  },
  {
    id: "3",
    content: "Sure! The order number is #ORD-2024-001234",
    timestamp: new Date(Date.now() - 1680000),
    isOwn: false
  },
  {
    id: "4",
    content: "Thank you! Let me look that up for you. I can see your order was shipped yesterday and should arrive by tomorrow. Here's your tracking number: 1Z999AA1234567890",
    timestamp: new Date(Date.now() - 1620000),
    isOwn: true,
    status: "read"
  },
  {
    id: "5",
    content: "That's great! Thank you so much for the quick help. Is there a way to get notifications about delivery updates?",
    timestamp: new Date(Date.now() - 1560000),
    isOwn: false
  }
];

export function CustomerServiceChat() {
  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  
  const textareaRef = useTextareaResize(newMessage, 1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations: Conversation[] = defaultCustomers.map((customer, index) => ({
    id: customer.id,
    customer,
    lastMessage: {
      id: `last-${customer.id}`,
      content: index === 0 ? "That's great! Thank you so much for the quick help..." : "Hi, I need help with my account settings",
      timestamp: new Date(Date.now() - (index * 300000)),
      isOwn: index % 2 === 1
    },
    unreadCount: index === 0 ? 0 : Math.floor(Math.random() * 5),
    isActive: customer.id === selectedConversation
  }));

  const selectedCustomer = defaultCustomers.find(c => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      isOwn: true,
      status: "sent"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate customer response
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thank you for your message! Let me help you with that.",
        timestamp: new Date(),
        isOwn: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status: Customer["status"]) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority: Customer["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conversations Sidebar */}
      <div className={cn(
        "w-80 border-r border-border bg-background flex flex-col transition-transform duration-300 z-50",
        "fixed md:relative h-full",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  conversation.isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  setSidebarOpen(false);
                }}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.customer.avatar} />
                    <AvatarFallback>
                      {conversation.customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                    getStatusColor(conversation.customer.status)
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {conversation.customer.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", getPriorityColor(conversation.customer.priority))}
                    >
                      {conversation.customer.priority}
                    </Badge>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {selectedCustomer && (
          <div className="p-4 border-b border-border bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedCustomer.avatar} />
                    <AvatarFallback>
                      {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                    getStatusColor(selectedCustomer.status)
                  )} />
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.status === "online" 
                      ? "Online" 
                      : selectedCustomer.lastSeen 
                        ? `Last seen ${formatLastSeen(selectedCustomer.lastSeen)}`
                        : "Offline"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.isOwn ? "justify-end" : "justify-start"
                )}
              >
                {!message.isOwn && selectedCustomer && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedCustomer.avatar} />
                    <AvatarFallback>
                      {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2",
                  message.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  <p className="text-sm">{message.content}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    message.isOwn ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isOwn && message.status && (
                      <CheckCheck className={cn(
                        "h-3 w-3",
                        message.status === "read" ? "text-blue-400" : "opacity-70"
                      )} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedCustomer?.avatar} />
                  <AvatarFallback>
                    {selectedCustomer?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
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
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-0 resize-none pr-12"
                rows={1}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Info Sidebar */}
      {selectedCustomer && (
        <div className="w-80 border-l border-border bg-background p-4 hidden lg:block">
          <div className="space-y-6">
            {/* Customer Profile */}
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={selectedCustomer.avatar} />
                <AvatarFallback className="text-lg">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor(selectedCustomer.status)
                )} />
                <span className="text-sm capitalize">{selectedCustomer.status}</span>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{selectedCustomer.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge className={getPriorityColor(selectedCustomer.priority)}>
                    {selectedCustomer.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <h4 className="font-medium mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div>
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Conversation
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Conversation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Demo() {
  return <CustomerServiceChat />;
}
