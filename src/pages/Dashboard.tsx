
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, Users, MessageCircle, User, Star, Filter, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [showProfileResults, setShowProfileResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const categories = ["All", "Technology", "Design", "Language", "Marketing", "Music", "Cooking", "Fitness"];

  // Fetch profiles from Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*");

        if (error) {
          throw error;
        }

        setProfiles(data || []);
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
  }, [toast]);

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
      const skills = [
        profile.skills_offered?.toLowerCase() || "",
        profile.skills_wanted?.toLowerCase() || "",
        profile.skills?.toLowerCase() || ""
      ].join(",");
      
      return fullName.includes(query) || 
             bio.includes(query) || 
             location.includes(query) || 
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

  const skills = [
    {
      id: 1,
      title: "React Development",
      description: "Learn modern React with hooks, context, and best practices",
      user: "Sarah Chen",
      userAvatar: "SC",
      rating: 4.9,
      reviews: 23,
      category: "Technology",
      duration: "2-3 hours/week",
      level: "Intermediate"
    },
    {
      id: 2,
      title: "UI/UX Design",
      description: "Master user interface and user experience design principles",
      user: "Mike Johnson",
      userAvatar: "MJ",
      rating: 4.8,
      reviews: 18,
      category: "Design",
      duration: "1-2 hours/week",
      level: "Beginner"
    },
    {
      id: 3,
      title: "Spanish Conversation",
      description: "Practice conversational Spanish with a native speaker",
      user: "Maria Rodriguez",
      userAvatar: "MR",
      rating: 5.0,
      reviews: 31,
      category: "Language",
      duration: "1 hour/week",
      level: "All Levels"
    },
    {
      id: 4,
      title: "Digital Marketing",
      description: "Learn SEO, social media marketing, and content strategy",
      user: "Alex Kim",
      userAvatar: "AK",
      rating: 4.7,
      reviews: 15,
      category: "Marketing",
      duration: "2 hours/week",
      level: "Beginner"
    },
    {
      id: 5,
      title: "Guitar Lessons",
      description: "Learn acoustic guitar from basics to intermediate level",
      user: "Tom Wilson",
      userAvatar: "TW",
      rating: 4.9,
      reviews: 27,
      category: "Music",
      duration: "1 hour/week",
      level: "Beginner"
    },
    {
      id: 6,
      title: "Italian Cooking",
      description: "Authentic Italian recipes and cooking techniques",
      user: "Giuseppe Rossi",
      userAvatar: "GR",
      rating: 4.8,
      reviews: 22,
      category: "Cooking",
      duration: "2 hours/week",
      level: "All Levels"
    }
  ];

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <Link to="/" className="text-xl font-semibold text-slate-900">SkillSwap Platform</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/requests">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Requests
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

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
                    {filteredProfiles.map((profile) => (
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
                            {profile.skills_offered && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {profile.skills_offered.split(',').slice(0, 2).map((skill: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                                ))}
                                {profile.skills_offered.split(',').length > 2 && (
                                  <span className="text-xs text-slate-500">+{profile.skills_offered.split(',').length - 2} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
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

        {/* Add Skill Button */}
        <div className="mb-6">
          <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Share Your Skills
          </Button>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <Card key={skill.id} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-300">
                    {skill.category}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-slate-600 ml-1">
                      {skill.rating} ({skill.reviews})
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg text-slate-900">{skill.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-600">
                  {skill.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {skill.userAvatar}
                    </div>
                    <span className="text-sm text-slate-700">{skill.user}</span>
                  </div>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {skill.level}
                  </Badge>
                </div>
                
                <div className="text-sm text-slate-600 mb-4">
                  <p>{skill.duration}</p>
                </div>

                <div className="flex space-x-2">
                  <Link to={`/skill/${skill.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                      View Details
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white">
                    Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No skills found matching your criteria.</p>
            <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
