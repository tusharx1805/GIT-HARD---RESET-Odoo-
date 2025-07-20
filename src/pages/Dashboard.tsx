import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Filter, Plus, ChevronLeft, ChevronRight, Languages } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [showProfileResults, setShowProfileResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedProfiles, setDisplayedProfiles] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{[key: string]: boolean}>({});
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  

  
  const PROFILES_PER_PAGE = 3;

  const categories = ["All", "Technology", "Design","Coding Languages","Cloud Computing", "Data Science", "Marketing", "Business", "Technical Writing"];

  // Helper function to parse skills from various formats
  const parseSkills = (skillsData: any): string[] => {
    if (!skillsData) return [];
    
    // If it's already an array
    if (Array.isArray(skillsData)) {
      return skillsData.map(skill => String(skill).trim()).filter(Boolean);
    }
    
    // If it's a string
    if (typeof skillsData === 'string') {
      let cleaned = skillsData.trim();
      
      // Remove outer brackets if present
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
      }
      
      // Handle JSON array string
      try {
        const parsed = JSON.parse(`[${cleaned}]`);
        if (Array.isArray(parsed)) {
          return parsed.map(skill => String(skill).trim()).filter(Boolean);
        }
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated
      }
      
      // Split by comma and clean each skill
      return cleaned
        .split(',')
        .map(skill => skill.trim().replace(/^["']|["']$/g, '')) // Remove quotes
        .filter(Boolean);
    }
    
    return [];
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(data);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch profiles from Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        
        // Filter out current user from profiles list
        const filteredData = currentUser ? data?.filter(profile => profile.id !== currentUser.id) : data;
        setProfiles(filteredData || []);
        
        // Calculate total pages
        const pages = Math.ceil((filteredData?.length || 0) / PROFILES_PER_PAGE);
        setTotalPages(pages > 0 ? pages : 1);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load profiles",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast, currentUser, PROFILES_PER_PAGE]);
  
  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!currentUser) return;
      
      const { data, error } = await supabase
        .from("swap_requests")
        .select("*")
        .eq("sender_id", currentUser.id)
        .eq("status", "pending");
        
      if (error) {
        console.error("Error fetching pending requests:", error);
        return;
      }
      
      const pendingMap: {[key: string]: boolean} = {};
      data?.forEach(request => {
        pendingMap[request.receiver_id] = true;
      });
      
      setPendingRequests(pendingMap);
    };
    
    fetchPendingRequests();
  }, [currentUser]);

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles([]);
      setShowProfileResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = profiles.filter(profile => {
      const fullName = profile.full_name?.toLowerCase() || "";
      const bio = profile.bio?.toLowerCase() || "";
      const location = profile.location?.toLowerCase() || "";
      
      // Parse skills properly for search
      const skillsOffered = parseSkills(profile.skills_offered).join(" ").toLowerCase();
      const skillsWanted = parseSkills(profile.skills_wanted).join(" ").toLowerCase();
      const skills = parseSkills(profile.skills).join(" ").toLowerCase();
      
      return fullName.includes(query) || 
             bio.includes(query) || 
             location.includes(query) || 
             skillsOffered.includes(query) ||
             skillsWanted.includes(query) ||
             skills.includes(query);
    });

    setFilteredProfiles(filtered);
    setShowProfileResults(filtered.length > 0);
  }, [searchQuery, profiles]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowProfileResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update displayed profiles based on current page and filters
  useEffect(() => {
    if (profiles.length === 0) return;
    
    let filtered = [...profiles];
    
    // Apply category filter if not "All"
    if (selectedCategory !== "All") {
      filtered = filtered.filter(profile => {
        const skillsOffered = parseSkills(profile.skills_offered).join(" ");
        return skillsOffered.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
    const endIndex = startIndex + PROFILES_PER_PAGE;
    const paginatedProfiles = filtered.slice(startIndex, endIndex);
    
    setDisplayedProfiles(paginatedProfiles);
    setTotalPages(Math.ceil(filtered.length / PROFILES_PER_PAGE) || 1);
  }, [profiles, currentPage, selectedCategory, PROFILES_PER_PAGE]);
  
  // Helper function to generate a valid UUID v4 format
  const generateUUID = () => {
    // Using the standard UUID v4 format with random values
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  const handleSendRequest = async (receiverId: string, offeredSkill: string, wantedSkill: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to send a skill request",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Looking up UUIDs for skills: ${offeredSkill}, ${wantedSkill}`);
      
      // First, find the UUIDs for the skills from the skills table
      // Look up offered skill UUID
      const cleanOfferedSkill = offeredSkill.trim();
      console.log(`Looking up offered skill: "${cleanOfferedSkill}"`); 
      
      const { data: offeredSkillData, error: offeredSkillError } = await supabase
        .from("skills")
        .select("id")
        .eq("name", cleanOfferedSkill)
        .single();
      
      if (offeredSkillError || !offeredSkillData) {
        console.error("Error finding offered skill:", offeredSkillError);
        throw new Error(`Skill "${offeredSkill}" not found in the skills table`);
      }
      
      // Look up wanted skill UUID
      const cleanWantedSkill = wantedSkill.trim();
      console.log(`Looking up wanted skill: "${cleanWantedSkill}"`); 
      
      const { data: wantedSkillData, error: wantedSkillError } = await supabase
        .from("skills")
        .select("id")
        .eq("name", cleanWantedSkill)
        .single();
      
      if (wantedSkillError || !wantedSkillData) {
        console.error("Error finding wanted skill:", wantedSkillError);
        throw new Error(`Skill "${wantedSkill}" not found in the skills table`);
      }
      
      console.log(`Found skill UUIDs: ${offeredSkillData.id}, ${wantedSkillData.id}`);
      
      // Insert the swap request with the skill UUIDs
      const { error } = await supabase
        .from("swap_requests")
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: receiverId,
            offered_skill: offeredSkillData.id, // Use the UUID from the skills table
            wanted_skill: wantedSkillData.id, // Use the UUID from the skills table
            status: "pending",
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      // Update pending requests
      setPendingRequests(prev => ({
        ...prev,
        [receiverId]: true
      }));
      
      toast({
        title: "Request Sent",
        description: "Your skill swap request has been sent successfully."
      });
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navigation showBreadcrumbs={false} currentPage="Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Discover Skills</h1>
          <p className="text-slate-600">Find amazing people to learn from and share your expertise</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative" ref={searchResultsRef}>
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search skills, topics, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowProfileResults(true)}
              className="pl-10 pr-4 py-3 text-lg border-slate-200 focus:border-slate-400"
            />
            
            {/* Profile Search Results Dropdown */}
            {showProfileResults && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
                <div className="p-2 border-b bg-slate-50">
                  <p className="text-sm font-medium text-slate-700">People</p>
                </div>
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-sm text-slate-500">Loading profiles...</p>
                  </div>
                ) : filteredProfiles.length > 0 ? (
                  <div>
                    {filteredProfiles.map((profile) => {
                      const skillsOffered = parseSkills(profile.skills_offered);
                      return (
                        <Link 
                          to={`/user/${profile.id}`} 
                          key={profile.id}
                          className="block p-3 hover:bg-slate-50 transition-colors border-b last:border-0"
                          onClick={() => setShowProfileResults(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {(profile.full_name || "U").split(" ").map((word: string) => word[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{profile.full_name || "Unnamed User"}</p>
                              <p className="text-sm text-slate-500 truncate">{profile.location || "No location"}</p>
                              {skillsOffered.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {skillsOffered.slice(0, 2).map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                                  ))}
                                  {skillsOffered.length > 2 && (
                                    <span className="text-xs text-slate-500">+{skillsOffered.length - 2} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-slate-500">No profiles found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 
                  "bg-slate-900 text-white hover:bg-slate-800" : 
                  "border-slate-300 text-slate-600 hover:bg-slate-50"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        

        {/* Profiles Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-slate-500">Loading profiles...</p>
            </div>
          ) : displayedProfiles.length > 0 ? (
            displayedProfiles.map((profile) => {
              const initials = (profile.full_name || "U").split(" ").map((word: string) => word[0]).join("");
              const skillsOffered = parseSkills(profile.skills_offered);
              const skillsWanted = parseSkills(profile.skills_wanted);
              const rating = profile.rating || Math.floor(Math.random() * 3) + 2; // Random rating between 2-5 if not available
              const reviews = profile.reviews || Math.floor(Math.random() * 10) + 1; // Random reviews if not available
              
              return (
                <Card key={profile.id} className="hover:shadow-md transition-shadow border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Profile Photo */}
                      <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xl font-bold flex-shrink-0">
                        {initials}
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-slate-900">{profile.full_name || "Unnamed User"}</h3>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-slate-600 ml-1">
                              {rating.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                        
                        {/* Skills Offered */}
                        <div className="mb-2">
                          <p className="text-sm text-green-600 font-medium mb-1">Skills Offered →</p>
                          <div className="flex flex-wrap gap-1">
                            {skillsOffered.length > 0 ? skillsOffered.map((skill: string, idx: number) => (
                              <Badge key={`offered-${idx}`} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {skill}
                              </Badge>
                            )) : (
                              <span className="text-sm text-slate-400">No skills offered</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Skills Wanted */}
                        <div className="mb-3">
                          <p className="text-sm text-blue-600 font-medium mb-1">Skills Wanted →</p>
                          <div className="flex flex-wrap gap-1">
                            {skillsWanted.length > 0 ? skillsWanted.map((skill: string, idx: number) => (
                              <Badge key={`wanted-${idx}`} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {skill}
                              </Badge>
                            )) : (
                              <span className="text-sm text-slate-400">No skills wanted</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => navigate(`/user/${profile.id}`)}
                          >
                            View Profile
                          </Button>
                          
                          {pendingRequests[profile.id] ? (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="bg-slate-100 text-slate-500" 
                              disabled
                            >
                              Request Pending
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                // Find a skill to offer and a skill to request
                                const currentUserSkills = parseSkills(currentUser?.skills_offered);
                                const profileSkills = parseSkills(profile.skills_offered);
                                
                                const offeredSkill = currentUserSkills.length > 0 ? currentUserSkills[0] : "General Skills";
                                const wantedSkill = profileSkills.length > 0 ? profileSkills[0] : "General Skills";
                                
                                handleSendRequest(profile.id, offeredSkill, wantedSkill);
                              }}
                            >
                              Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No profiles found matching your criteria.</p>
              <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
          
          {/* Pagination */}
          {displayedProfiles.length > 0 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 p-0 ${currentPage === page ? "bg-slate-900" : ""}`}
                >
                  {page}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;