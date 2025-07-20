import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Edit, Search, X, Upload, User, Save, Github, Linkedin, Phone, ExternalLink } from "lucide-react";
import { useEffect, useState, useMemo } from "react"; // Import useMemo
import Navigation from "@/components/Navigation";
import { useCallback } from "react";

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  email: string;
  skillsOffered: string[];
  skillsWanted: string[];
  isAvailable: boolean;
  avatar_url: string;
  github_url: string;
  linkedin_url: string;
  phone_number: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  // Keep search queries as local state
  const [searchQueryOffered, setSearchQueryOffered] = useState("");
  const [searchQueryWanted, setSearchQueryWanted] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  // filteredSkills will be derived inside SkillsSection
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customSkillOffered, setCustomSkillOffered] = useState("");
  const [customSkillWanted, setCustomSkillWanted] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    bio: "",
    location: "",
    email: "",
    skillsOffered: [],
    skillsWanted: [],
    isAvailable: false,
    avatar_url: "",
    github_url: "",
    linkedin_url: "",
    phone_number: ""
  });
  const handleOfferedSkillsChange = useCallback(
    (skills: string[]) => {
      setProfileData((prev) => ({ ...prev, skills_offered: skills }));
    },
    []
  );

  const handleWantedSkillsChange = useCallback(
    (skills: string[]) => {
      setProfileData((prev) => ({ ...prev, skills_wanted: skills }));
    },
    []
  );

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchAvailableSkills();
  }, []);

  // Helper function to validate and format URLs
  const formatUrl = (url: string, platform: string): string => {
    if (!url) return "";
    
    // Remove any whitespace
    url = url.trim();
    
    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Format GitHub URLs
    if (platform === 'github') {
      if (url.startsWith('github.com/')) {
        return `https://${url}`;
      } else if (url.startsWith('/')) {
        return `https://github.com${url}`;
      } else {
        return `https://github.com/${url}`;
      }
    }
    
    // Format LinkedIn URLs
    if (platform === 'linkedin') {
      if (url.startsWith('linkedin.com/')) {
        return `https://${url}`;
      } else if (url.startsWith('/in/') || url.startsWith('/company/')) {
        return `https://linkedin.com${url}`;
      } else {
        return `https://linkedin.com/in/${url}`;
      }
    }
    
    return url;
  };

  // Removed the filtering useEffect here.
  // The filtering will now happen within the SkillsSection component itself using useMemo.

  const fetchProfile = async () => {
    try {
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

      const parseSkills = (skills: any) => {
        if (!skills) return [];

        // If it's a string that looks like a stringified array, parse it
        if (typeof skills === 'string' && skills.startsWith('[') && skills.endsWith(']')) {
          try {
            const parsed = JSON.parse(skills);
            if (Array.isArray(parsed)) {
              return parsed.filter(s => s && typeof s === 'string' && s.trim().length > 0);
            }
          } catch (e) {
            console.error('Error parsing skills JSON string:', e);
            // Fall through to other parsing methods
          }
        }

        // If it's a regular comma-separated string
        if (typeof skills === 'string') {
          return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        // If it's already an array
        if (Array.isArray(skills)) {
          return skills.filter(s => s && typeof s === 'string' && s.trim().length > 0);
        }

        return [];
      };

      const profileDataFromDB = {
        name: data.full_name || "",
        bio: data.bio || "",
        location: data.location || "",
        email: data.email || "",
        skillsOffered: parseSkills(data.skills_offered),
        skillsWanted: parseSkills(data.skills_wanted),
        isAvailable: data.is_available || false,
        avatar_url: data.avatar_url || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        phone_number: data.phone_number || ""
      };

      setProfileData(profileDataFromDB);

      // Set profile image URL from database
      if (data.avatar_url) {
        setProfileImageUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchAvailableSkills = async () => {
    const sampleSkills = [
      "React", "JavaScript", "TypeScript", "HTML", "CSS", "Node.js", "Express",
      "Python", "Java", "C#", "PHP", "Ruby", "Swift", "Kotlin", "Flutter",
      "React Native", "Angular", "Vue.js", "Next.js", "GraphQL", "REST API",
      "SQL", "NoSQL", "MongoDB", "Firebase", "AWS", "Azure", "GCP",
      "Docker", "Kubernetes", "CI/CD", "Git", "Agile", "Scrum", "UI/UX Design",
      "Figma", "Adobe XD", "Photoshop", "Illustrator", "Machine Learning",
      "Data Science", "DevOps", "Testing", "Cybersecurity"
    ];

    setAvailableSkills(sampleSkills);
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated.",
          variant: "destructive"
        });
        return;
      }

      let profilePhotoUrl = profileData.avatar_url;

      // Upload profile image if selected
      if (profileImage) {
        try {
          // Create a safe file name without special characters
          const fileExt = profileImage.name.split('.').pop();
          const timestamp = new Date().getTime(); // Add timestamp to prevent caching issues
          const filePath = `${userId}/profile_${timestamp}.${fileExt}`;

          // Make sure the file size is reasonable (< 2MB)
          if (profileImage.size > 2 * 1024 * 1024) {
            toast({
              title: "Error",
              description: "Image size must be less than 2MB.",
              variant: "destructive"
            });
            return;
          }

          // Upload the file with proper content type
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileImage, {
              upsert: true,
              contentType: profileImage.type // Set the correct content type
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            // Check for missing bucket error (Supabase returns specific error codes/messages)
            if (
              uploadError.message?.toLowerCase().includes('bucket') &&
              uploadError.message?.toLowerCase().includes('not found')
            ) {
              toast({
                title: "Avatars Bucket Missing",
                description: "The avatars bucket does not exist. Please ask an administrator to create it in Supabase Storage.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Error",
                description: "Failed to upload profile image: " + uploadError.message,
                variant: "destructive"
              });
            }
          } else {
            // Get the public URL
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            if (urlData && urlData.publicUrl) {
              profilePhotoUrl = urlData.publicUrl;
              console.log("Image uploaded successfully:", profilePhotoUrl);
            } else {
              console.error("Failed to get public URL");
            }
          }
        } catch (error) {
          console.error("Profile image upload error:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred while uploading the image.",
            variant: "destructive"
          });
        }
      }

      // Ensure skills are properly formatted for database
      const skillsOffered = Array.isArray(profileData.skillsOffered)
        ? profileData.skillsOffered.filter(skill => skill && typeof skill === 'string' && skill.trim().length > 0)
        : [];

      const skillsWanted = Array.isArray(profileData.skillsWanted)
        ? profileData.skillsWanted.filter(skill => skill && typeof skill === 'string' && skill.trim().length > 0)
        : [];

      console.log('Saving skills offered:', skillsOffered);
      console.log('Saving skills wanted:', skillsWanted);

      const { error, data } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          email: profileData.email,
          skills_offered: skillsOffered,
          skills_wanted: skillsWanted,
          is_available: profileData.isAvailable,
          avatar_url: profilePhotoUrl,
          github_url: profileData.github_url,
          linkedin_url: profileData.linkedin_url,
          phone_number: profileData.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      setProfileData(prev => ({ ...prev, avatar_url: profilePhotoUrl }));
      setProfileImage(null);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size must be less than 5MB.",
          variant: "destructive"
        });
        return;
      }

      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const addSkill = (skill: string, type: 'offered' | 'wanted') => {
    if (!skill.trim()) return;

    const skillToAdd = skill.trim();
    const currentSkills = type === 'offered' ? profileData.skillsOffered : profileData.skillsWanted;

    if (currentSkills.includes(skillToAdd)) return;

    setProfileData(prev => ({
      ...prev,
      [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: [...currentSkills, skillToAdd]
    }));

    // Clear search after adding
    if (type === 'offered') {
      setSearchQueryOffered("");
    } else {
      setSearchQueryWanted("");
    }
  };

  const addCustomSkill = (type: 'offered' | 'wanted') => {
    const customSkill = type === 'offered' ? customSkillOffered : customSkillWanted;
    if (!customSkill.trim()) return;

    addSkill(customSkill, type);

    // Clear custom skill input
    if (type === 'offered') {
      setCustomSkillOffered("");
    } else {
      setCustomSkillWanted("");
    }
  };

  const removeSkill = (skill: string, type: 'offered' | 'wanted') => {
    setProfileData(prev => ({
      ...prev,
      [type === 'offered' ? 'skillsOffered' : 'skillsWanted']:
        prev[type === 'offered' ? 'skillsOffered' : 'skillsWanted'].filter(s => s !== skill)
    }));
  };

  const moveAllSkillsToOffered = () => {
    if (profileData.skillsWanted.length === 0) return;

    setProfileData(prev => ({
      ...prev,
      skillsOffered: [...new Set([...prev.skillsOffered, ...prev.skillsWanted])],
      skillsWanted: []
    }));

    toast({
      title: "Skills Moved",
      description: "All wanted skills have been moved to offered skills.",
    });
  };

  const SkillsSection = ({
    title,
    skills,
    type,
    onChange
    // Remove searchQuery and filteredSkills from props if you manage them locally
  }: {
    title: string;
    skills: string[];
    type: 'offered' | 'wanted';
    onChange: (skills: string[]) => void;
  }) => {
    // Manage search query state locally within SkillsSection
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const customSkill = type === 'offered' ? customSkillOffered : customSkillWanted;
    const setCustomSkill = type === 'offered' ? setCustomSkillOffered : setCustomSkillWanted;

    // Use useMemo to filter skills based on localSearchQuery and availableSkills
    const filteredSkills = useMemo(() => {
      if (!localSearchQuery.trim()) return availableSkills;
      return availableSkills.filter(skill =>
        skill.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    }, [localSearchQuery, availableSkills]);

    // Handle adding skills, clearing local search query
    const handleAddSkill = (skill: string) => {
      addSkill(skill, type); // Use the addSkill from parent
      setLocalSearchQuery(""); // Clear the local search query
    };

    const handleAddCustomSkill = () => {
      const currentCustomSkill = type === 'offered' ? customSkillOffered : customSkillWanted;
      if (!currentCustomSkill.trim()) return;

      addSkill(currentCustomSkill, type);
      setCustomSkill(""); // Clear custom skill input
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{title}</Label>
          {type === 'wanted' && skills.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={moveAllSkillsToOffered}
            >
              Move All to Offered
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <Badge
                key={index}
                variant={type === 'offered' ? 'default' : 'outline'}
                className="px-3 py-1 text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill, type)}
                  className="ml-2 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No skills added yet</span>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${type === 'offered' ? 'skills to offer' : 'skills to learn'}...`}
              className="pl-10"
              value={localSearchQuery} // Use local search query
              onChange={(e) => setLocalSearchQuery(e.target.value)} // Update local search query
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setLocalSearchQuery("")} // Clear local search query
            disabled={!localSearchQuery}
          >
            Clear
          </Button>
        </div>

        {/* Custom skill input */}
        <div className="flex gap-2">
          <Input
            placeholder={`Add custom ${type === 'offered' ? 'skill to offer' : 'skill to learn'}...`}
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomSkill(); // Use the local handler
              }
            }}
          />
          <Button
            onClick={handleAddCustomSkill} // Use the local handler
            disabled={!customSkill.trim()}
          >
            Add
          </Button>
        </div>

        {localSearchQuery && ( // Show filtered results only if there's a local search query
          <div className="border rounded-md p-2 max-h-40 overflow-y-auto bg-white">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center rounded"
                  onClick={() => handleAddSkill(skill)} // Use the local handler
                >
                  <span>{skill}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    +
                  </Button>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <p className="text-center py-2 text-gray-500">No matching skills found</p>
                {localSearchQuery.trim() && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleAddSkill(localSearchQuery); // Add the custom skill if no match
                      }}
                    >
                      Add "{localSearchQuery}" as custom skill
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SocialLinksSection = () => (
    <div className="space-y-4">
      <Label className="text-base font-medium">Social Links</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GitHub */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Github className="w-4 h-4" />
            GitHub
          </Label>
          {isEditing ? (
            <Input
              placeholder="github.com/username or username"
              value={profileData.github_url}
              onChange={(e) => setProfileData(prev => ({ ...prev, github_url: e.target.value }))}
            />
          ) : (
            <div className="min-h-[2.5rem] flex items-center">
              {profileData.github_url ? (
                <a
                  href={formatUrl(profileData.github_url, 'github')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  <Github className="w-4 h-4" />
                  {profileData.github_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm">Not provided</span>
              )}
            </div>
          )}
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Label>
          {isEditing ? (
            <Input
              placeholder="linkedin.com/in/username or username"
              value={profileData.linkedin_url}
              onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
            />
          ) : (
            <div className="min-h-[2.5rem] flex items-center">
              {profileData.linkedin_url ? (
                <a
                  href={formatUrl(profileData.linkedin_url, 'linkedin')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  {profileData.linkedin_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm">Not provided</span>
              )}
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          {isEditing ? (
            <Input
              placeholder="+1 (555) 123-4567"
              type="tel"
              value={profileData.phone_number}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
            />
          ) : (
            <div className="min-h-[2.5rem] flex items-center">
              {profileData.phone_number ? (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  {profileData.phone_number}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">Not provided</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showBreadcrumbs={true} currentPage="Profile" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                  {profileImageUrl || profileData.avatar_url ? (
                    <img
                      src={profileImageUrl || profileData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xl font-semibold"
                    />
                    <Textarea
                      placeholder="Bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="resize-none"
                    />
                    <Input
                      placeholder="Location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profileData.name || "Your Name"}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        {profileData.bio || "Add a bio to tell others about yourself"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {profileData.location && (
                        <span>📍 {profileData.location}</span>
                      )}
                      {profileData.email && (
                        <span>✉️ {profileData.email}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profileData.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profileData.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileImage(null);
                        setProfileImageUrl(profileData.avatar_url); // Reset to saved avatar
                        setCustomSkillOffered("");
                        setCustomSkillWanted("");
                        fetchProfile(); // Reset to original data
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
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

        {/* Social Links Card (Always visible) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Connect with Me
            </CardTitle>
            <CardDescription>
              Share your social links to make it easy for others to connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialLinksSection />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Skills I Offer</CardTitle>
                  <CardDescription>
                    Skills you can help others with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillsSection
                    title=""
                    skills={profileData.skillsOffered}
                    type="offered"
                    onChange={handleOfferedSkillsChange}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Skills I Want to Learn</CardTitle>
                  <CardDescription>
                    Skills you'd like to learn from others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillsSection
                    title=""
                    skills={profileData.skillsWanted}
                    type="wanted"
                    onChange={handleWantedSkillsChange}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
                <CardDescription>
                  Control when others can reach out to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Available for Skill Exchange</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Show that you're open to connecting with others
                    </p>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={profileData.isAvailable}
                      onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, isAvailable: checked }))}
                    />
                  ) : (
                    <Badge variant={profileData.isAvailable ? "default" : "secondary"}>
                      {profileData.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your profile preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-gray-600">
                    Your profile is currently visible to all users. You can adjust visibility settings here.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Data Management</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Export Profile Data
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;