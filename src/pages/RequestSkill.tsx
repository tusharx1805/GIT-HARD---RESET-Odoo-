import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";

const RequestSkill = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const statusOptions = ["All", "Pending", "Accepted", "Rejected"];

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Error fetching user:", authError);
        return;
      }
      
      if (user) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        setCurrentUser(data);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Helper function to get skill name from skills table
  const getSkillName = async (skillId: string) => {
    if (!skillId) return "Unknown Skill";
    
    const { data, error } = await supabase
      .from("skills")
      .select("name")
      .eq("id", skillId)
      .single();
      
    if (error) {
      console.error("Error fetching skill:", error);
      return "Unknown Skill";
    }
    
    return data?.name || "Unknown Skill";
  };

  // Fetch all requests related to the current user
  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch requests where the current user is either the sender or receiver
        const { data: sentRequests, error: sentError } = await supabase
          .from("swap_requests")
          .select(`
            id,
            status,
            created_at,
            sender_id,
            receiver_id,
            offered_skill,
            wanted_skill,
            message
          `)
          .eq("sender_id", currentUser.id);

        const { data: receivedRequests, error: receivedError } = await supabase
          .from("swap_requests")
          .select(`
            id,
            status,
            created_at,
            sender_id,
            receiver_id,
            offered_skill,
            wanted_skill,
            message
          `)
          .eq("receiver_id", currentUser.id);

        if (sentError || receivedError) {
          throw sentError || receivedError;
        }

        // Combine requests
        const allRequests = [...(sentRequests || []), ...(receivedRequests || [])];
        
        // Get additional info for each request
        const formattedRequests = await Promise.all(allRequests.map(async (request) => {
          // Determine if current user is sender or receiver
          const isCurrentUserSender = request.sender_id === currentUser.id;
          const otherUserId = isCurrentUserSender ? request.receiver_id : request.sender_id;
          
          // Get other user's profile
          const { data: data, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, rating, email")
            .eq("id", otherUserId)
            .single();

          if (profileError) {
            console.error("Error fetching other user's profile:", profileError, "for userId:", otherUserId);
          }
          console.log("Fetched profile for otherUserId:", otherUserId, data);

          // Get skill names name: 
          const offeredSkillName = await getSkillName(request.offered_skill);
          const wantedSkillName = await getSkillName(request.wanted_skill);
            
          return {
            id: request.id,
            name: data?.full_name || data?.email || `Click on view profile`,
            avatarUrl: data?.avatar_url || null,
            avatarInitial: (data?.full_name?.charAt(0) || data?.email?.charAt(0) || "U"),
            skillOffered: isCurrentUserSender ? offeredSkillName : wantedSkillName,
            skillWanted: isCurrentUserSender ? wantedSkillName : offeredSkillName,
            status: request.status,
            rating: data?.rating || 0,
            date: new Date(request.created_at).toLocaleDateString(),
            isCurrentUserSender,
            otherUserId,
            message: request.message
          };
        }));
        
        setRequests(formattedRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast({
          title: "Error",
          description: "Failed to load requests. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [currentUser, toast]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.skillOffered.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.skillWanted.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || request.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleAccept = async (id: string) => {
    try {
      const { error } = await supabase
        .from("swap_requests")
        .update({ status: "accepted" })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status: "accepted" } : request
        )
      );
      
      toast({
        title: "Request Accepted",
        description: "You have accepted the skill swap request.",
      });
      
      // Create a new conversation for the users if one doesn't exist
      const request = requests.find(r => r.id === id);
      if (request) {
        const { error: convError } = await supabase
          .from("conversations")
          .insert([
            {
              user1_id: currentUser.id,
              user2_id: request.otherUserId,
              created_at: new Date().toISOString()
            }
          ]);
          
        if (convError) {
          console.error("Error creating conversation:", convError);
        }
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("swap_requests")
        .update({ status: "rejected" })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status: "rejected" } : request
        )
      );
      
      toast({
        title: "Request Rejected",
        description: "You have rejected the skill swap request.",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted": return "bg-green-100 text-green-800 border-green-300";
      case "rejected": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navigation showBreadcrumbs={true} currentPage="Swap Requests" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className="h-10"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-slate-500 text-lg">Loading requests...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-lg overflow-hidden">
                        {request.avatarUrl ? 
                          <img src={request.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : 
                          request.avatarInitial
                        }
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg text-slate-900">{request.name}</h3>
                          <Link to={`/user/${request.otherUserId}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {request.isCurrentUserSender ? "You Offer" : "They Offer"}: {request.skillOffered}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            {request.isCurrentUserSender ? "You Want" : "They Want"}: {request.skillWanted}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-slate-600 ml-1">
                              {request.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-slate-500">
                            Requested on {request.date}
                          </span>
                        </div>
                        {request.message && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <strong>Message:</strong> {request.message}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        Status: {request.status}
                      </div>
                      
                      {request.status.toLowerCase() === "pending" && !request.isCurrentUserSender && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {request.status.toLowerCase() === "accepted" && (
                        <Link to="/messages">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No requests found matching your criteria.</p>
              <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
              <div className="mt-6">
                <Link to="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Pagination - Only show if we have multiple pages */}
        {filteredRequests.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {}} // TODO: Implement pagination
              disabled={true} // Disable until pagination is implemented
            >
              &lt;
            </Button>
            <Button
              variant="default"
              size="sm"
              className="w-8 h-8"
              disabled
            >
              1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {}} // TODO: Implement pagination
              disabled={true} // Disable until pagination is implemented
            >
              &gt;
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestSkill;