
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
      <header className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">SkillSwap Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Exchange Skills,<br />
            <span className="text-primary">Expand Horizons</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect with people worldwide to learn new skills and share your expertise. 
            Build meaningful connections while growing personally and professionally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                Explore Skills
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-accent px-8 py-3">
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
            <h2 className="text-3xl font-semibold text-foreground mb-4">How SkillSwap Works</h2>
            <p className="text-lg text-muted-foreground">Simple, effective, and rewarding skill exchange</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-border hover:shadow-lg transition-shadow hover:border-primary/30">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-accent text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Ready to Start Your Skill Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join our community today and begin exchanging skills with others.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-primary-foreground px-8 py-3 shadow-lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
