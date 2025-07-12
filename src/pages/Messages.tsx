// messages.tsx (FULL LENGTH with real-time Supabase chat)

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Users,
  MessageCircle,
  User,
  Send,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Navigation from "@/components/Navigation";

const Messages = () => {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // Load user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
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

  // Load all users
  useEffect(() => {
    if (!user?.id) return;
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", user.id);
      if (!error) setUsers(data || []);
    };
    fetchUsers();
  }, [user?.id]);

  // Load and subscribe to messages
  useEffect(() => {
    if (!user?.id || !selectedChat?.id) return;
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
      setIsLoading(false);
    };
    fetchMessages();

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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, user]);

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
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } else {
      console.error(error);
    }
    setIsSending(false);
  };

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <Link to="/" className="text-xl font-bold text-gray-900">
                SkillSwap
              </Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" /> Chat Users
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedChat(u)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                      selectedChat?.id === u.id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {u.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {u.full_name || "Unknown User"}
                        </h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          Tap to message
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {selectedChat.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2) || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedChat.full_name}</h3>
                      <Badge variant="outline" className="text-xs">Direct Message</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">No messages yet.</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap ${
                            msg.sender_id === user?.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs mt-1 text-right opacity-60">
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || isSending}>
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a user to start chatting
                  </h3>
                  <p className="text-gray-500">Choose a user from the list to begin messaging</p>
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
