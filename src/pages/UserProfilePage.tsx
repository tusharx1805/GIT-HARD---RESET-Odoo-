import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const UserProfilePage = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setProfileData({
          name: data.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
          email: data.email || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <Link to="/profile">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Your Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Your Profile
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              {/* Left Side: Text Details */}
              <div className="flex-1 space-y-2 mb-4 md:mb-0 md:mr-4">
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-600">{profileData.bio || "No bio available"}</p>
                <p className="text-sm text-gray-500">{profileData.location || "No location specified"}</p>
              </div>

              {/* Right Side: Profile Circle + Buttons */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.name?.split(" ").map(word => word[0]).join("") || "U"}
                </div>

                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Skills this user can teach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {/* This would be populated from the database in a real app */}
              <Badge>React</Badge>
              <Badge>JavaScript</Badge>
              <Badge>UI Design</Badge>
              <Badge>Node.js</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
