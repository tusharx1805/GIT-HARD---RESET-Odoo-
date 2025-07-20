import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Search, Github, Linkedin, Phone, ExternalLink, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

const UserProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    isAvailable: false,
    createdAt: "",
    updatedAt: "",
    skills: "",
    rawData: {} as any,
  });
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  if (!id) return <div>User not found</div>;

  // Helper function to format GitHub URL
  const formatGithubUrl = (github: string) => {
    if (!github) return "";
    if (github.startsWith("http")) return github;
    if (github.startsWith("github.com/")) return `https://${github}`;
    return `https://github.com/${github}`;
  };

  // Helper function to format LinkedIn URL
  const formatLinkedinUrl = (linkedin: string) => {
    if (!linkedin) return "";
    if (linkedin.startsWith("http")) return linkedin;
    if (linkedin.startsWith("linkedin.com/")) return `https://${linkedin}`;
    if (linkedin.startsWith("in/")) return `https://linkedin.com/${linkedin}`;
    return `https://linkedin.com/in/${linkedin}`;
  };

  // Helper function to format phone number for tel: link
  const formatPhoneLink = (phone: string) => {
    if (!phone) return "";
    return `tel:${phone.replace(/\D/g, "")}`;
  };

  useEffect(() => {
    // Fetch all profiles
    const fetchAllProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*");

        if (error) throw error;

        setAllProfiles(data || []);
        setFilteredProfiles(data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles");
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load profiles",
          variant: "destructive",
        });
      }
    };

    // Fetch specific user profile if ID is provided
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Parse skills from string to array if needed
        const parseSkills = (skillsData: any) => {
          if (!skillsData) return [];
          if (Array.isArray(skillsData)) return skillsData;
          if (typeof skillsData === 'string') {
            try {
              const parsed = JSON.parse(skillsData);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return skillsData.replace(/[\[\]"']/g, '').split(',').map((s: string) => s.trim()).filter(s => s);
            }
          }
          return [];
        };

        const skillsOffered = parseSkills(data.skills_offered);
        const skillsWanted = parseSkills(data.skills_wanted);
        const skills = data.skills || "";

        setProfileData({
          name: data.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
          email: data.email || "",
          phone: data.phone || data.phone_number || "",
          github: data.github || data.github_url || data.github_username || "",
          linkedin: data.linkedin || data.linkedin_url || data.linkedin_profile || "",
          skillsOffered,
          skillsWanted,
          isAvailable: data.is_available || false,
          createdAt: data.created_at || "",
          updatedAt: data.updated_at || "",
          skills,
          rawData: data,
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

    // If ID is provided, fetch specific profile, otherwise fetch all profiles
    if (id) {
      fetchUserProfile();
    } else {
      fetchAllProfiles();
    }
  }, [id, toast]);
  
  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(allProfiles);
      return;
    }
    
    const filtered = allProfiles.filter(profile => {
      const fullName = profile.full_name?.toLowerCase() || "";
      const bio = profile.bio?.toLowerCase() || "";
      const location = profile.location?.toLowerCase() || "";
      const skills = [
        profile.skills_offered?.toLowerCase() || "",
        profile.skills_wanted?.toLowerCase() || "",
        profile.skills?.toLowerCase() || ""
      ].join(",");
      
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || 
             bio.includes(query) || 
             location.includes(query) || 
             skills.includes(query);
    });
    
    setFilteredProfiles(filtered);
  }, [searchQuery, allProfiles]);

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
      <Navigation showBreadcrumbs={true} currentPage="User Profile" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar - Only show when not viewing a specific profile */}
        {!id && (
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search skills, topics, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-slate-200 focus:border-slate-400"
              />
            </div>
          </div>
        )}
        
        {/* Show specific profile if ID is provided */}
        {id ? (
          <>
            {/* Profile Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  {/* Left Side: Text Details */}
                  <div className="flex-1 space-y-2 mb-4 md:mb-0 md:mr-4">
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600">{profileData.bio || "No bio available"}</p>
                    <p className="text-sm text-gray-500">{profileData.location || "No location specified"}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant={profileData.isAvailable ? "default" : "secondary"} className={`mr-2 ${profileData.isAvailable ? 'bg-green-500' : ''}`}>
                        {profileData.isAvailable ? "Available" : "Not Available"}
                      </Badge>
                      <p className="text-xs text-gray-400">Member since {new Date(profileData.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Right Side: Profile Circle + Buttons */}
                  <div className="flex flex-col items-center space-y-2">
                    {/* Profile initials */}
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("") || "U"}
                    </div>

                    {/* Message Button */}
                    <Button onClick={() => navigate("/messages", { state: { userId: id } })}>
                      Message
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>


            {/* Contact Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Connect With Me</CardTitle>
                <CardDescription>Ways to connect with this user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Email */}
                  {profileData.email && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <a 
                          href={`mailto:${profileData.email}`}
                          className="text-sm text-blue-600 hover:text-blue-800 block truncate"
                        >
                          {profileData.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {profileData.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <a 
                          href={formatPhoneLink(profileData.phone)}
                          className="text-sm text-green-600 hover:text-green-800 block truncate"
                        >
                          {profileData.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* GitHub */}
                  {profileData.github && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Github className="w-5 h-5 text-gray-900 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">GitHub</p>
                        <a 
                          href={formatGithubUrl(profileData.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-700 hover:text-gray-900 flex items-center truncate"
                        >
                          <span className="truncate">{profileData.github}</span>
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {profileData.linkedin && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Linkedin className="w-5 h-5 text-blue-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                        <a 
                          href={formatLinkedinUrl(profileData.linkedin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:text-blue-900 flex items-center truncate"
                        >
                          <span className="truncate">{profileData.linkedin}</span>
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show message if no contact info is available */}
                {!profileData.email && !profileData.phone && !profileData.github && !profileData.linkedin && (
                  <p className="text-sm text-gray-500 text-center py-4">No contact information provided</p>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Skills this user can teach and wants to learn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Skills Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skillsOffered.length > 0 ? (
                        profileData.skillsOffered.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No skills offered</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Skills Wanted</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skillsWanted.length > 0 ? (
                        profileData.skillsWanted.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No skills wanted</p>
                      )}
                    </div>
                  </div>

                  {profileData.skills && (
                    <div>
                      <h3 className="font-medium mb-2">General Skills</h3>
                      <p className="text-sm">{profileData.skills}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Profile Data */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Profile Information</CardTitle>
                <CardDescription>All available profile data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profileData.rawData).map(([key, value]) => {
                      // Skip arrays and objects for direct display
                      if (typeof value === 'object' && value !== null) return null;
                      
                      // Skip the ID field and contact fields (they're shown above)
                      if (key === 'id' || key === 'skills_offered' || key === 'skills_wanted' || key === 'skills' || 
                          key === 'email' || key === 'phone' || key === 'github' || key === 'linkedin') return null;
                      
                      // Format the key for display
                      const formattedKey = key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');
                      
                      // Format date values
                      let formattedValue = value;
                      if (key.includes('_at') && value) {
                        try {
                          formattedValue = new Date(value as string).toLocaleString();
                        } catch (e) {
                          // Keep original value if date parsing fails
                        }
                      }
                      
                      // Format boolean values
                      if (typeof value === 'boolean') {
                        formattedValue = value ? 'Yes' : 'No';
                      }
                      
                      return (
                        <div key={key} className="border-b pb-2">
                          <p className="text-sm font-medium">{formattedKey}</p>
                          <p className="text-sm break-words">{formattedValue?.toString() || 'Not specified'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Show all profiles if no ID is provided */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => {
                // Parse skills from string to array if needed
                const skillsOffered = profile.skills_offered ? 
                  typeof profile.skills_offered === 'string' ? profile.skills_offered.split(',').slice(0, 3).map((s: string) => s.trim()) : profile.skills_offered.slice(0, 3) :
                  [];
                
                return (
                  <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{profile.full_name || "Unnamed User"}</CardTitle>
                          <CardDescription className="line-clamp-1">{profile.location || "No location"}</CardDescription>
                          
                          {/* Contact indicators */}
                          <div className="flex items-center space-x-2 mt-2">
                            {profile.github && (
                              <div title="GitHub available">
                                <Github className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                            {profile.linkedin && (
                              <div title="LinkedIn available">
                                <Linkedin className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            {profile.phone && (
                              <div title="Phone available">
                                <Phone className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                            {profile.email && (
                              <div title="Email available">
                                <Mail className="w-4 h-4 text-blue-500" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {(profile.full_name || "U").split(" ").map((word: string) => word[0]).join("")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm line-clamp-2 h-10">{profile.bio || "No bio available"}</p>
                      
                      <div>
                        <p className="text-xs font-medium mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {skillsOffered.length > 0 ? (
                            skillsOffered.map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No skills listed</span>
                          )}
                          {profile.skills_offered && profile.skills_offered.split(',').length > 3 && (
                            <Badge variant="outline" className="text-xs">+{profile.skills_offered.split(',').length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Link to={`/user/${profile.id}`}>
                          <Button size="sm" className="w-full">View Profile</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : searchQuery ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No users found matching "{searchQuery}"</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>Clear Search</Button>
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;