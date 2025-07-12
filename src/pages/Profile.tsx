import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Edit, MessageCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    email: "",
    skillsOffered: "",
    skillsWanted: "",
    isAvailable: false,
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch profile:", error);
        return;
      }

      setProfileData({
        name: data.full_name || "",
        bio: data.bio || "",
        location: data.location || "",
        email: data.email || "",
        skillsOffered: data.skills_offered || "",
        skillsWanted: data.skills_wanted || "",
        isAvailable: data.is_available || false,
      });
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.name,
        bio: profileData.bio,
        email: profileData.email,
        location: profileData.location,
        skills_offered: profileData.skillsOffered,
        skills_wanted: profileData.skillsWanted,
        is_available: profileData.isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

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
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
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
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1 space-y-2 mb-4 md:mb-0 md:mr-4">
                {isEditing ? (
                  <>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold"
                    />
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                    <Input
                      placeholder="Location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600">{profileData.bio}</p>
                    <p className="text-sm text-gray-500">{profileData.location}</p>
                    <p className="text-sm mt-1"><strong>Skills Offered:</strong> {profileData.skillsOffered || "N/A"}</p>
                    <p className="text-sm mt-1"><strong>Skills Wanted:</strong> {profileData.skillsWanted || "N/A"}</p>
                    <p className="text-sm mt-1"><strong>Available:</strong> {profileData.isAvailable ? "Yes" : "No"}</p>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.name?.split(" ").map(word => word[0]).join("") || "U"}
                </div>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList>
            <TabsTrigger value="skills">My Skills</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillsOffered">Skills Offered</Label>
                  <Textarea
                    id="skillsOffered"
                    value={profileData.skillsOffered}
                    onChange={(e) => setProfileData(prev => ({ ...prev, skillsOffered: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillsWanted">Skills Wanted</Label>
                  <Textarea
                    id="skillsWanted"
                    value={profileData.skillsWanted}
                    onChange={(e) => setProfileData(prev => ({ ...prev, skillsWanted: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={profileData.isAvailable}
                    onChange={(e) => setProfileData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  />
                  <Label htmlFor="isAvailable">Available for Skill Swaps</Label>
                </div>
                <Button onClick={handleSaveProfile}>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
