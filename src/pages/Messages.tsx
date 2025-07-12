import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, MessageCircle, User, Send, Search, ArrowLeft } from "lucide-react";

const Messages = () => {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Load all other users
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("id, full_name")
      .neq("id", user.id)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setUsers(data);
      });
  }, [user]);

  // Load messages for selected user - FIXED VERSION
  useEffect(() => {
    if (!user?.id || !selectedChat?.id) return;

    const loadMessages = async () => {
      // Try a simpler approach first
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${selectedChat.id},receiver_id.eq.${selectedChat.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        
        // Fallback: try with individual queries
        const [sent, received] = await Promise.all([
          supabase
            .from("messages")
            .select("*")
            .eq("sender_id", user.id)
            .eq("receiver_id", selectedChat.id),
          supabase
            .from("messages")
            .select("*")
            .eq("sender_id", selectedChat.id)
            .eq("receiver_id", user.id)
        ]);

        if (sent.data && received.data) {
          const allMessages = [...sent.data, ...received.data]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          setMessages(allMessages);
        }
      } else {
        // Filter messages for this specific chat
        const chatMessages = data.filter(msg => 
          (msg.sender_id === user.id && msg.receiver_id === selectedChat.id) ||
          (msg.sender_id === selectedChat.id && msg.receiver_id === user.id)
        );
        setMessages(chatMessages);
      }
    };

    loadMessages();

    // Simplified real-time subscription
    const channel = supabase
      .channel(`messages-${user.id}-${selectedChat.id}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages"
        },
        (payload) => {
          console.log("New message received:", payload.new);
          const msg = payload.new;
          
          // Check if this message belongs to the current chat
          const isForThisChat = 
            (msg.sender_id === user.id && msg.receiver_id === selectedChat.id) ||
            (msg.sender_id === selectedChat.id && msg.receiver_id === user.id);
            
          if (isForThisChat) {
            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some(m => m.id === msg.id);
              if (exists) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [selectedChat, user]);

  // Handle sending message - ENHANCED VERSION
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !selectedChat?.id) return;

    console.log("Sending message:", newMessage);
    
    const messageData = {
      sender_id: user.id,
      receiver_id: selectedChat.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
    } else {
      console.log("Message sent successfully:", data);
      setNewMessage("");
      
      // Optimistically add the message to the UI
      setMessages(prev => [...prev, data]);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <Link to="/" className="text-xl font-bold text-gray-900">SkillSwap</Link>
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
          {/* User List */}
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
                <div className="space-y-1">
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
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {u.full_name}
                          </h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            Tap to message
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {selectedChat.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedChat.full_name}</h3>
                      <Badge variant="outline" className="text-xs">Direct Message</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_id === user?.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs mt-1 text-right opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>

                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
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
                  <p className="text-gray-500">Choose a user from the list</p>
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