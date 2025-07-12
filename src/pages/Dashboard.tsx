
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, Users, MessageCircle, User, Star, Filter, Plus } from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Technology", "Design", "Language", "Marketing", "Music", "Cooking", "Fitness"];

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
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search skills, topics, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-slate-200 focus:border-slate-400"
            />
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
