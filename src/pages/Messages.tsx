// messages.tsx (FIXED - Proper chat layout, scrolling, and notifications)

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link,useParams } from "react-router-dom";
import {
  Users,
  MessageCircle,
  User,
  Send,
  Search,
  ArrowLeft,
  Loader2,
  Bell,
  BellRing,
  UserCheck,
  RefreshCw,
  Check,
  CheckCheck,
} from "lucide-react";

const Messages = () => {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]); // Users with accepted swap requests
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConnectionsOnly, setShowConnectionsOnly] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [hasNotification, setHasNotification] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => scrollToBottom(), [messages]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (message: string, senderName: string) => {
    if (Notification.permission === 'granted') {
      new Notification(`New message from ${senderName}`, {
        body: message,
        icon: '/favicon.ico',
        tag: 'skillswap-message'
      });
    }
    setHasNotification(true);
    // Auto-clear notification indicator after 3 seconds
    setTimeout(() => setHasNotification(false), 3000);
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch users and connections from swap_requests
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchUsersAndConnections = async () => {
      // Fetch all users
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", user.id);
      setUsers(allUsers || []);

      // Fetch connections from swap_requests with status 'accepted'
      const { data: acceptedRequests } = await supabase
        .from("swap_requests")
        .select(`
          *,
          sender:profiles!swap_requests_sender_id_fkey(id, full_name),
          receiver:profiles!swap_requests_receiver_id_fkey(id, full_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      // Format connections to get the other user's info
      const connectedUsers = acceptedRequests?.map(request => {
        const otherUser = request.sender_id === user.id ? request.receiver : request.sender;
        return otherUser;
      }) || [];
      
      setConnections(connectedUsers);
    };
    
    fetchUsersAndConnections();
  }, [user?.id]);

  // Fetch all messages for chat previews and unread counts
  useEffect(() => {
    if (!user?.id) return;
    const fetchAllMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("timestamp", { ascending: true });
      
      setAllMessages(data || []);
      
      // Calculate unread counts (assuming messages don't have read field yet)
      // For now, we'll count recent messages from others as potentially unread
      const unreadMap: Record<string, number> = {};
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      data?.forEach(msg => {
        if (msg.receiver_id === user.id && 
            msg.sender_id !== user.id && 
            msg.timestamp > oneHourAgo &&
            (!selectedChat || selectedChat.id !== msg.sender_id)) {
          const senderId = msg.sender_id;
          unreadMap[senderId] = (unreadMap[senderId] || 0) + 1;
        }
      });
      setUnreadCounts(unreadMap);
    };
    fetchAllMessages();
  }, [user?.id, selectedChat]);

  useEffect(() => {
    if (!user?.id || !selectedChat?.id) return;
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${user.id})`)
        .order("timestamp", { ascending: true });
      setMessages(data || []);
      setIsLoading(false);
    };
    fetchMessages();

    // Clear unread count and notifications when opening chat
    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[selectedChat.id];
      return updated;
    });
    setHasNotification(false);

    const channel = supabase
      .channel(`chat-${user.id}-${selectedChat.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedChat.id) ||
            (msg.sender_id === selectedChat.id && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, msg]);
            setAllMessages((prev) => [...prev, msg]);
            
            // Show notification if message is from someone else and not currently in this chat
            if (msg.sender_id !== user.id) {
              // Clear notification immediately since user is in the chat
              setHasNotification(false);
              // Clear unread count immediately
              setUnreadCounts(prev => {
                const updated = { ...prev };
                delete updated[selectedChat.id];
                return updated;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, user]);

  // Listen for new messages globally for notifications
  useEffect(() => {
    if (!user?.id) return;

    const globalChannel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          if (msg.receiver_id === user.id && msg.sender_id !== user.id) {
            // Only update unread count and show notification if not currently chatting with this user
            if (!selectedChat || selectedChat.id !== msg.sender_id) {
              setUnreadCounts(prev => ({
                ...prev,
                [msg.sender_id]: (prev[msg.sender_id] || 0) + 1
              }));
              
              const sender = users.find(u => u.id === msg.sender_id);
              showNotification(msg.message, sender?.full_name || 'Someone');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user?.id, selectedChat, users]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);
    
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: selectedChat.id,
        message: newMessage,
        // swap_id can be null for general chat messages
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setAllMessages((prev) => [...prev, data]);
      setNewMessage("");
    }
    setIsSending(false);
  };

  // Get users to display based on filter
  const getUsersToDisplay = () => {
    return showConnectionsOnly ? connections : users;
  };

  // Handle filter toggle with animation
  const handleFilterToggle = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowConnectionsOnly(!showConnectionsOnly);
      setIsTransitioning(false);
    }, 150);
  };

  // Enhanced filtering logic with sorting
  const filteredUsers = getUsersToDisplay()
    .map((u) => {
      const history = allMessages.filter(
        (m) =>
          (m.sender_id === u.id && m.receiver_id === user?.id) ||
          (m.sender_id === user?.id && m.receiver_id === u.id)
      );
      const lastMessage = history.slice(-1)[0];
      const unreadCount = unreadCounts[u.id] || 0;
      return { ...u, lastMessage, unreadCount, hasMessages: history.length > 0 };
    })
    .filter((u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Sort: users with unread messages first, then by most recent message, then alphabetically
    .sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      if (a.hasMessages && !b.hasMessages) return -1;
      if (!a.hasMessages && b.hasMessages) return 1;
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      }
      return (a.full_name || '').localeCompare(b.full_name || '');
    });

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (days === 1) {
        return "Yesterday";
      } else if (days < 7) {
        return d.toLocaleDateString([], { weekday: 'short' });
      } else {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return "";
    }
  };

  // Get connection status for a user
  const getConnectionStatus = (userId: string) => {
    return connections.some(c => c.id === userId);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <Link to="/" className="text-xl font-bold text-gray-900">
                SkillSwap
              </Link>
              {hasNotification && (
                <div className="flex items-center space-x-1 text-blue-600 animate-pulse">
                  <BellRing className="w-4 h-4" />
                  <span className="text-xs font-medium">New message</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Skills
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex h-0">
        <div className="grid lg:grid-cols-3 gap-6 w-full h-full">
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat Users
                  </div>
                  {Object.keys(unreadCounts).length > 0 && (
                    <Badge variant="destructive" className="text-xs animate-bounce">
                      {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <Button
                      variant={showConnectionsOnly ? "default" : "outline"}
                      size="sm"
                      onClick={handleFilterToggle}
                      className={`relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        showConnectionsOnly 
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md" 
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                      disabled={isTransitioning}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`transition-transform duration-300 ${
                          showConnectionsOnly ? "rotate-180" : "rotate-0"
                        }`}>
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="font-medium">Swap Partners</span>
                        {connections.length > 0 && (
                          <Badge 
                            variant={showConnectionsOnly ? "secondary" : "outline"} 
                            className={`ml-1 text-xs transition-all duration-200 ${
                              showConnectionsOnly 
                                ? "bg-white/20 text-white border-white/30" 
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {connections.length}
                          </Badge>
                        )}
                      </div>
                      {showConnectionsOnly && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-y-auto min-h-0">
                <div className={`transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
                  {filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="space-y-2">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto" />
                        <p className="font-medium">
                          {showConnectionsOnly 
                            ? "No swap partners found" 
                            : searchQuery 
                            ? "No users match your search"
                            : "No users available"
                          }
                        </p>
                        {showConnectionsOnly && (
                          <p className="text-xs text-gray-400">
                            Accept some swap requests to see your partners here!
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    filteredUsers.map((u, index) => (
                      <div
                        key={u.id}
                        onClick={() => setSelectedChat(u)}
                        className={`p-4 cursor-pointer border-b transition-all duration-200 hover:bg-gray-50 transform hover:-translate-y-0.5 ${
                          selectedChat?.id === u.id 
                            ? "bg-blue-50 border-r-4 border-r-blue-500 shadow-md" 
                            : u.unreadCount > 0 
                            ? "bg-blue-25 hover:bg-blue-50" 
                            : ""
                        }`}
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: isTransitioning ? "none" : "fadeInUp 0.3s ease-out forwards"
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {u.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                            </div>
                            {u.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse shadow-lg">
                                {u.unreadCount > 9 ? '9+' : u.unreadCount}
                              </div>
                            )}
                            {getConnectionStatus(u.id) && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                <UserCheck className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-sm font-semibold truncate ${
                                u.unreadCount > 0 ? "text-blue-900" : "text-gray-900"
                              }`}>
                                {u.full_name || "Unknown User"}
                              </h3>
                            </div>
                            <p className={`text-xs truncate mt-1 ${
                              u.unreadCount > 0 ? "text-blue-700 font-medium" : "text-gray-500"
                            }`}>
                              {u.lastMessage?.message || "No messages yet"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {u.lastMessage?.timestamp ? formatTime(u.lastMessage.timestamp) : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {selectedChat.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{selectedChat.full_name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-white">Direct Message</Badge>
                          {getConnectionStatus(selectedChat.id) && (
                            <Badge className="text-xs flex items-center space-x-1 bg-green-100 text-green-800 border-green-200">
                              <UserCheck className="w-3 h-3" />
                              <span>Swap Partner</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                        <span className="text-gray-500">Loading messages...</span>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <MessageCircle className="w-10 h-10 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium mb-2">No messages yet</p>
                          <p className="text-gray-500 text-sm">Start the conversation!</p>
                          {getConnectionStatus(selectedChat.id) && (
                            <p className="text-xs mt-2 text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                              ✓ You have an active swap partnership
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"} animate-fadeIn`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                            msg.sender_id === user?.id
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <div className={`flex items-center justify-end mt-2 space-x-1 ${
                            msg.sender_id === user?.id ? "text-blue-200" : "text-gray-400"
                          }`}>
                            <p className="text-xs">
                              {formatTime(msg.timestamp)}
                            </p>
                            {msg.sender_id === user?.id && (
                              <CheckCheck className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="border-t p-4 flex-shrink-0 bg-white">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <Input
                      placeholder={getConnectionStatus(selectedChat.id) 
                        ? "Message your swap partner..." 
                        : "Type your message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isSending}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Select a user to start chatting
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    Choose a user from the list to begin your conversation
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-green-600" />
                      </div>
                      <span>Notifications enabled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{connections.length} swap partners</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;