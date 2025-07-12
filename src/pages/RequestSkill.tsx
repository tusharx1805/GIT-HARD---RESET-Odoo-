
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Users, MessageCircle, User, Star, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RequestSkill = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const { toast } = useToast();

  const statusOptions = ["All", "Pending", "Accepted", "Rejected"];

  const requests = [
    {
      id: 1,
      name: "Marc Demo",
      avatar: "MD",
      skillOffered: "Web Dev",
      skillWanted: "Design",
      rating: 3.4,
      reviews: 5,
      status: "Pending"
    },
    {
      id: 2,
      name: "Mitchell",
      avatar: "MI",
      skillOffered: "Web Dev",
      skillWanted: "Music theory",
      rating: 2.5,
      reviews: 8,
      status: "Pending"
    },
    {
      id: 3,
      name: "Joe Wills",
      avatar: "JW",
      skillOffered: "Java Script",
      skillWanted: "Game design",
      rating: 4.0,
      reviews: 5,
      status: "Pending"
    },
    {
      id: 4,
      name: "Anna",
      avatar: "AN",
      skillOffered: "UI Design",
      skillWanted: "React",
      rating: 4.5,
      reviews: 12,
      status: "Rejected"
    }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.skillOffered.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.skillWanted.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAccept = (id: number) => {
    toast({
      title: "Request Accepted",
      description: "You have accepted the skill swap request.",
    });
  };

  const handleReject = (id: number) => {
    toast({
      title: "Request Rejected",
      description: "You have rejected the skill swap request.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Accepted": return "bg-green-100 text-green-800 border-green-300";
      case "Rejected": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <Link to="/" className="text-xl font-semibold text-slate-900">SkillSwap Platform</Link>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Link to="/dashboard" className="hover:text-slate-900">Home</Link>
                <span>/</span>
                <span>Swap Requests</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

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
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-lg">
                      {request.avatar}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-slate-900">{request.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          Skill Offered: {request.skillOffered}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          Skill Wanted: {request.skillWanted}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-600 ml-1">
                            rating {request.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                      Status: {request.status}
                    </div>
                    
                    {request.status === "Pending" && (
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No requests found matching your criteria.</p>
            <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-8 pt-6 border-t">
          <Button variant="outline" size="sm" disabled>
            &lt;
          </Button>
          {[1, 2, 3, 4].map((page) => (
            <Button
              key={page}
              variant={page === 1 ? "default" : "outline"}
              size="sm"
              className="w-8 h-8"
            >
              {page}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestSkill;
