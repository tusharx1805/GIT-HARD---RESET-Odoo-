
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "react-router-dom";
import { Star, Clock, User, Calendar, Award, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const SkillDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock data - in a real app, this would be fetched based on the ID
  const skill = {
    id: 1,
    title: "React Development",
    description: "Learn modern React with hooks, context, and best practices. This comprehensive course covers everything from basic components to advanced patterns used in production applications.",
    longDescription: "In this comprehensive React development course, you'll master the fundamentals and advanced concepts of React. We'll start with basic components and JSX, then progress to hooks, context API, state management, and testing. You'll also learn about performance optimization, code splitting, and deployment strategies.",
    teacher: {
      name: "Sarah Chen",
      avatar: "SC",
      bio: "Senior Frontend Developer at Tech Corp with 8+ years of experience",
      rating: 4.9,
      totalStudents: 150,
      yearsTeaching: 3
    },
    category: "Technology",
    level: "Intermediate",
    duration: "2-3 hours/week",
    totalHours: 40,
    price: "Free (Skill Exchange)",
    rating: 4.9,
    reviews: 23,
    students: 15,
    whatYouWillLearn: [
      "Modern React hooks (useState, useEffect, useContext, etc.)",
      "Component composition and reusability",
      "State management with Context API",
      "Testing React components",
      "Performance optimization techniques",
      "Deployment and production best practices"
    ],
    requirements: [
      "Basic knowledge of JavaScript (ES6+)",
      "Understanding of HTML and CSS",
      "Familiarity with npm/yarn",
      "Code editor (VS Code recommended)"
    ],
    reviewsList: [
      {
        id: 1,
        student: "Mike Johnson",
        avatar: "MJ",
        rating: 5,
        comment: "Amazing teacher! Sarah explains complex concepts in a very clear way.",
        date: "2 weeks ago"
      },
      {
        id: 2,
        student: "Emily Davis",
        avatar: "ED",
        rating: 5,
        comment: "Best React course I've taken. The practical examples were very helpful.",
        date: "1 month ago"
      },
      {
        id: 3,
        student: "Alex Kim",
        avatar: "AK",
        rating: 4,
        comment: "Great content and well-structured lessons. Highly recommended!",
        date: "1 month ago"
      }
    ]
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      toast({
        title: "Connection request sent!",
        description: `Your request to learn ${skill.title} has been sent to ${skill.teacher.name}.`,
      });
      setIsConnecting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showBreadcrumbs={true} currentPage="Skill Details" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Header */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary">{skill.category}</Badge>
                <Badge variant="outline">{skill.level}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{skill.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{skill.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{skill.rating}</span>
                  <span className="ml-1">({skill.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{skill.students} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{skill.duration}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">What You'll Learn</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Skill Exchange</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{skill.longDescription}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {skill.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {skill.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Award className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4">
                  {skill.reviewsList.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {review.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{review.student}</h4>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                    {skill.teacher.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{skill.teacher.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{skill.teacher.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{skill.teacher.bio}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-medium">{skill.teacher.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Years Teaching:</span>
                    <span className="font-medium">{skill.teacher.yearsTeaching}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skill Info */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{skill.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="font-medium">{skill.totalHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-green-600">{skill.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <Badge variant="outline">{skill.level}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? "Connecting..." : "Connect & Learn"}
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Teacher
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetails;
