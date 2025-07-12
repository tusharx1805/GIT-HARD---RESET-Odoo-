
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, Star, ArrowRight, BookOpen, MessageCircle, Trophy } from "lucide-react";

const Index = () => {
  const featuredSkills = [
    {
      id: 1,
      title: "React Development",
      user: "Sarah Chen",
      userAvatar: "SC",
      rating: 4.9,
      reviews: 23,
      category: "Technology",
      level: "Intermediate"
    },
    {
      id: 2,
      title: "UI/UX Design",
      user: "Mike Johnson",
      userAvatar: "MJ",
      rating: 4.8,
      reviews: 18,
      category: "Design",
      level: "Beginner"
    },
    {
      id: 3,
      title: "Spanish Conversation",
      user: "Maria Rodriguez",
      userAvatar: "MR",
      rating: 5.0,
      reviews: 31,
      category: "Language",
      level: "All Levels"
    }
  ];

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-slate-700" />,
      title: "Learn New Skills",
      description: "Connect with experts and learn skills you've always wanted to master."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-slate-700" />,
      title: "Share Your Expertise",
      description: "Teach others and earn while sharing your knowledge and passion."
    },
    {
      icon: <Trophy className="w-8 h-8 text-slate-700" />,
      title: "Build Your Reputation",
      description: "Get rated and build a strong profile in the skill-sharing community."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">SkillSwap Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Exchange Skills,<br />
            <span className="text-slate-700">Expand Horizons</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Connect with people worldwide to learn new skills and share your expertise. 
            Build meaningful connections while growing personally and professionally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3">
                Explore Skills
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3">
                Share Your Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">How SkillSwap Works</h2>
            <p className="text-lg text-slate-600">Simple, effective, and rewarding skill exchange</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Featured Skills</h2>
            <p className="text-lg text-slate-600">Discover popular skills from our community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredSkills.map((skill) => (
              <Card key={skill.id} className="hover:shadow-lg transition-shadow border-slate-200">
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
                  <Link to={`/skill/${skill.id}`}>
                    <Button variant="outline" size="sm" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/dashboard">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                View All Skills
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Ready to Start Your Skill Journey?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of learners and teachers in our growing community
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3">
              Join SkillSwap Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">SkillSwap Platform</span>
            </div>
            <div className="text-slate-600">
              © 2024 SkillSwap Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
