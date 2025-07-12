import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Edit, MessageCircle, Plus, Star, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
  name: "",
  bio: "",
  location: "",
  email: ""
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
    });
  };

  fetchProfile();
}, []);


  const mySkills = [
    {
      id: 1,
      title: "React Development",
      description: "Modern React with hooks, context, and best practices",
      category: "Technology",
      level: "Advanced",
      students: 15,
      rating: 4.9,
      reviews: 23
    },
    {
      id: 2,
      title: "Node.js Backend",
      description: "Server-side JavaScript and API development",
      category: "Technology",
      level: "Intermediate",
      students: 8,
      rating: 4.7,
      reviews: 12
    }
  ];

  const learningSkills = [
    {
      id: 3,
      title: "Spanish Conversation",
      teacher: "Maria Rodriguez",
      progress: 75,
      nextSession: "Tomorrow, 3:00 PM"
    },
    {
      id: 4,
      title: "Guitar Lessons",
      teacher: "Tom Wilson",
      progress: 40,
      nextSession: "Friday, 7:00 PM"
    }
  ];

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
      updated_at: new Date().toISOString()
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


  const handleAddSkill = () => {
    toast({
      title: "Add new skill",
      description: "This would open a form to add a new skill.",
    });
  };

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
        {/* Profile Header */}
        <Card className="mb-8">
          <Card className="mb-8">
  <CardHeader>
    {/* Top Row: Search + Buttons */}
    <div className="flex justify-between items-center mb-4">
      <Input
        placeholder="Search users..."
        className="w-1/3"
        // Optional: Add onChange logic here
      />
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

    {/* Profile Info Row */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      {/* Left Side: Text Details */}
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
          </>
        )}
      </div>

      {/* Right Side: Profile Circle + Buttons */}
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

        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList>
            <TabsTrigger value="skills">My Skills</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Skills I Teach</h2>
                <Button onClick={handleAddSkill}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {mySkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary">{skill.category}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{skill.title}</CardTitle>
                      <CardDescription>{skill.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Level:</span>
                          <Badge variant="outline">{skill.level}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Students:</span>
                          <span className="text-sm font-medium">{skill.students}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">
                              {skill.rating} ({skill.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learning">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Skills I'm Learning</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {learningSkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{skill.title}</CardTitle>
                      <CardDescription>with {skill.teacher}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{skill.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${skill.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Next Session:</span>
                          <span className="text-sm font-medium">{skill.nextSession}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Message Teacher
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Supabase Auth User Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Auth Profile</CardTitle>
                  <CardDescription>
                    Your authenticated user information from Supabase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserProfile />
                </CardContent>
              </Card>
              
              {/* Original Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account information and preferences
                  </CardDescription>
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
                  <Button onClick={handleSaveProfile}>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
