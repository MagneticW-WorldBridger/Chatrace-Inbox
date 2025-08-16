"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Settings,
  User,
  Clock,
  CheckCheck,
  Check
} from "lucide-react";

interface ScrollState {
  isAtBottom: boolean;
  autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
  offset?: number;
  smooth?: boolean;
  content?: any;
}

function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { offset = 20, smooth = false, content } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastContentHeight = useRef(0);
  const userHasScrolled = useRef(false);

  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  const checkIsAtBottom = useCallback(
    (element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = useCallback(
    (instant?: boolean) => {
      if (!scrollRef.current) return;

      const targetScrollTop =
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      userHasScrolled.current = false;
    },
    [smooth]
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom(scrollRef.current);

    setScrollState((prev) => ({
      isAtBottom: atBottom,
      autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
    }));
  }, [checkIsAtBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const currentHeight = scrollElement.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight.current;

    if (hasNewContent) {
      if (scrollState.autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight.current === 0);
        });
      }
      lastContentHeight.current = currentHeight;
    }
  }, [content, scrollState.autoScrollEnabled, scrollToBottom]);

  const disableAutoScroll = useCallback(() => {
    const atBottom = scrollRef.current
      ? checkIsAtBottom(scrollRef.current)
      : false;

    if (!atBottom) {
      userHasScrolled.current = true;
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
  };
}

function MessageLoading() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
}

interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    avatar: string;
    isOnline: boolean;
    isCurrentUser?: boolean;
  };
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isTyping?: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  ticketNumber: string;
  department: string;
}

interface CustomerServiceChatProps {
  customer?: Customer;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  className?: string;
}

export function CustomerServiceChat({
  customer = {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop",
    status: "online",
    tags: ["Premium", "VIP"],
    priority: "high",
    ticketNumber: "CS-2024-001",
    department: "Technical Support"
  },
  initialMessages = [
    {
      id: "1",
      content: "Hello! I'm having trouble with my account login. Can you help me?",
      sender: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop",
        isOnline: true,
      },
      timestamp: "2:30 PM",
      status: "read",
    },
    {
      id: "2",
      content: "Of course! I'd be happy to help you with your login issue. Can you tell me what specific error message you're seeing?",
      sender: {
        name: "Agent Mike",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&q=80&crop=faces&fit=crop",
        isOnline: true,
        isCurrentUser: true,
      },
      timestamp: "2:31 PM",
      status: "read",
    },
    {
      id: "3",
      content: "It says 'Invalid credentials' but I'm sure my password is correct.",
      sender: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop",
        isOnline: true,
      },
      timestamp: "2:32 PM",
      status: "read",
    }
  ],
  onSendMessage,
  className,
}: CustomerServiceChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  const {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
  } = useAutoScroll({
    smooth: true,
    content: messages,
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: {
        name: "Agent Mike",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&q=80&crop=faces&fit=crop",
        isOnline: true,
        isCurrentUser: true,
      },
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    onSendMessage?.(inputValue);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
        ),
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg,
        ),
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (inputValue.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [inputValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTypingIndicator(Math.random() > 0.7);
    }, 3000);
    return () => clearTimeout(timer);
  }, [messages]);

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={cn("flex h-[700px] bg-background border rounded-lg overflow-hidden", className)}>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={customer.avatar} alt={customer.name} />
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-background",
                getStatusColor(customer.status)
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">
                {customer.status === "online" ? "Online" : `Last seen ${customer.lastSeen || "recently"}`}
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
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 relative">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto p-4 space-y-4"
            onWheel={disableAutoScroll}
            onTouchMove={disableAutoScroll}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender.isCurrentUser && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                  <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "flex flex-col max-w-[70%]",
                  message.sender.isCurrentUser && "items-end"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  <div className={cn(
                    "rounded-lg px-3 py-2 max-w-full break-words",
                    message.sender.isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    {message.content}
                  </div>
                  {message.sender.isCurrentUser && (
                    <div className="flex items-center justify-end mt-1">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {showTypingIndicator && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <MessageLoading />
                </div>
              </div>
            )}
          </div>

          {!isAtBottom && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 shadow-lg"
            >
              Scroll to bottom
            </Button>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-20 min-h-[40px] resize-none"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isTyping && (
            <p className="text-xs text-muted-foreground mt-1">Agent is typing...</p>
          )}
        </div>
      </div>

      {/* Customer Info Sidebar */}
      <div className="w-80 border-l bg-muted/30 p-4 space-y-6">
        <div>
          <h3 className="font-semibold text-foreground mb-3">Customer Information</h3>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{customer.name}</h4>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor(customer.status)
                )} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ticket:</span>
                  <span className="font-medium">{customer.ticketNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{customer.department}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Priority:</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getPriorityColor(customer.priority))} />
                    <span className="font-medium capitalize">{customer.priority}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Chat History
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div>
                <p className="text-foreground">Opened support ticket</p>
                <p className="text-muted-foreground text-xs">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <p className="text-foreground">Account verified</p>
                <p className="text-muted-foreground text-xs">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <div>
                <p className="text-foreground">Password reset requested</p>
                <p className="text-muted-foreground text-xs">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerServiceChatDemo() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Service Chat</h1>
          <p className="text-muted-foreground">Professional customer support interface with real-time messaging</p>
        </div>
        <CustomerServiceChat
          onSendMessage={(message) => console.log('Sent:', message)}
        />
      </div>
    </div>
  );
}
