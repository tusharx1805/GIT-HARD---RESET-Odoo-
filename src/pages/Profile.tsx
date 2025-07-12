import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Edit, MessageCircle, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    email: "",
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
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

      // Parse skills from string to array if needed
      const skillsOffered = data.skills_offered ? 
        typeof data.skills_offered === 'string' ? data.skills_offered.split(',').map(s => s.trim()) : data.skills_offered :
        [];
        
      const skillsWanted = data.skills_wanted ? 
        typeof data.skills_wanted === 'string' ? data.skills_wanted.split(',').map(s => s.trim()) : data.skills_wanted :
        [];

      setProfileData({
        name: data.full_name || "",
        bio: data.bio || "",
        location: data.location || "",
        email: data.email || "",
        skillsOffered,
        skillsWanted,
        isAvailable: data.is_available || false,
      });
    };

    fetchProfile();
    fetchAvailableSkills();
  }, []);

  // Fetch all available skills from the database
  const fetchAvailableSkills = async () => {
    // This is a sample list of skills - in production, you'd fetch this from your database
    const sampleSkills = [
      "React", "JavaScript", "TypeScript", "HTML", "CSS", "Node.js", "Express", 
      "Python", "Java", "C#", "PHP", "Ruby", "Swift", "Kotlin", "Flutter", 
      "React Native", "Angular", "Vue.js", "Next.js", "GraphQL", "REST API", 
      "SQL", "NoSQL", "MongoDB", "Firebase", "AWS", "Azure", "GCP", 
      "Docker", "Kubernetes", "CI/CD", "Git", "Agile", "Scrum", "UI/UX Design", 
      "Figma", "Adobe XD", "Photoshop", "Illustrator", "T-SQL"
    ];
    
    setAvailableSkills(sampleSkills);
    setFilteredSkills(sampleSkills);
  };
  
  // Filter skills based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSkills(availableSkills);
    } else {
      const filtered = availableSkills.filter(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSkills(filtered);
    }
  }, [searchQuery, availableSkills]);

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
        skills_offered: profileData.skillsOffered.join(','),
        skills_wanted: profileData.skillsWanted.join(','),
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
  
  // Add a skill to the offered skills list
  const addSkillOffered = (skill: string) => {
    if (skill.trim() !== "" && !profileData.skillsOffered.includes(skill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, skill.trim()]
      }));
    }
    setSearchQuery(""); // Clear search after adding
  };
  
  // Add a custom skill to the offered skills list
  const addCustomSkillOffered = () => {
    if (customSkill.trim() !== "" && !profileData.skillsOffered.includes(customSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, customSkill.trim()]
      }));
      setCustomSkill(""); // Clear custom skill input after adding
    }
  };

  // Remove a skill from the offered skills list
  const removeSkillOffered = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter(s => s !== skill)
    }));
  };

  // Add a skill to the wanted skills list
  const addSkillWanted = (skill: string) => {
    if (!profileData.skillsWanted.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, skill]
      }));
    }
    setSearchQuery(""); // Clear search after adding
  };

  // Remove a skill from the wanted skills list
  const removeSkillWanted = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter(s => s !== skill)
    }));
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
                    <div className="text-sm mt-1">
                      <strong>Skills Offered:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profileData.skillsOffered.length > 0 ? (
                          profileData.skillsOffered.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm mt-1">
                      <strong>Skills Wanted:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profileData.skillsWanted.length > 0 ? (
                          profileData.skillsWanted.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>
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

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>My Skills</CardTitle>
                <CardDescription>Manage your skills and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Skills I Offer</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.skillsOffered.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                        <button 
                          onClick={() => removeSkillOffered(skill)} 
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search skills to add..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
                  </div>
                  
                  {searchQuery && (
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill, index) => (
                          <div 
                            key={index} 
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => addSkillOffered(skill)}
                          >
                            <span>{skill}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              +
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-2 text-gray-500">No matching skills found</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label>Skills I Want to Learn</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.skillsWanted.map((skill, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                        {skill}
                        <button 
                          onClick={() => removeSkillWanted(skill)} 
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search skills to learn..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="text-xs" 
                      onClick={() => {
                        // Move all skills from Skills Wanted to Skills Offered
                        if (profileData.skillsWanted.length > 0) {
                          setProfileData(prev => ({
                            ...prev,
                            skillsOffered: [...new Set([...prev.skillsOffered, ...prev.skillsWanted])],
                            skillsWanted: []
                          }));
                          toast({
                            title: "Skills Moved",
                            description: "All skills wanted have been moved to skills offered."
                          });
                        }
                      }}
                    >
                      Move All to Skills Offered
                    </Button>
                  </div>
                  
                  {searchQuery && (
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill, index) => (
                          <div 
                            key={index} 
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => addSkillWanted(skill)}
                          >
                            <span>{skill}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              +
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-2 text-gray-500">No matching skills found</p>
                      )}
                    </div>
                  )}
                </div>
                
                <Button onClick={handleSaveProfile}>Save Skills</Button>
              </CardContent>
            </Card>
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
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.skillsOffered.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                        <button 
                          onClick={() => removeSkillOffered(skill)} 
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search skills to add..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
                  </div>
                  {searchQuery && (
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill, index) => (
                          <div 
                            key={index} 
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => addSkillOffered(skill)}
                          >
                            <span>{skill}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              +
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-2 text-gray-500">No matching skills found</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillsWanted">Skills Wanted</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.skillsWanted.map((skill, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                        {skill}
                        <button 
                          onClick={() => removeSkillWanted(skill)} 
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search skills to learn..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
                  </div>
                  {searchQuery && (
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill, index) => (
                          <div 
                            key={index} 
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => addSkillWanted(skill)}
                          >
                            <span>{skill}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              +
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-2 text-gray-500">No matching skills found</p>
                      )}
                    </div>
                  )}
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
