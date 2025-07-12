import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, MessageCircle, User, Send, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Messages = () => {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from("swap_requests")
        .select("*, profiles!swap_requests_sender_id_fkey(full_name), profiles!swap_requests_receiver_id_fkey(full_name)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted")
        .then(({ data, error }) => {
          if (error) console.error(error);
          else {
            const result = data.map((swap: any) => {
              const isSender = swap.sender_id === user.id;
              const partner = isSender ? swap.profiles_1 : swap.profiles;
              return {
                id: swap.id,
                partner_id: isSender ? swap.receiver_id : swap.sender_id,
                partner_name: partner.full_name,
                skill: `${swap.offered_skill} ⇄ ${swap.wanted_skill}`,
              };
            });
            setConversations(result);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    supabase
      .from("messages")
      .select("*")
      .eq("swap_id", selectedChat.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setMessages(data);
      });

    const subscription = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.swap_id === selectedChat.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedChat.partner_id,
      swap_id: selectedChat.id,
      message: newMessage,
    });

    if (!error) setNewMessage("");
    else console.error(error);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <MessageCircle className="w-5 h-5 mr-2" /> Messages
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                        selectedChat?.id === conversation.id
                          ? "bg-blue-50 border-r-2 border-r-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {conversation.partner_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {conversation.partner_name}
                            </h3>
                            <span className="text-xs text-gray-500">now</span>
                          </div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {conversation.skill}
                          </Badge>
                          <p className="text-sm text-gray-600 truncate">Last message...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {selectedChat.partner_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.partner_name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {selectedChat.skill}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
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
                  ))}
                </CardContent>

                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
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
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
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
