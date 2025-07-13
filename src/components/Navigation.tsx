import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MessageCircle, 
  User, 
  Home, 
  LogOut, 
  Menu, 
  X,
  Bell
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  showBreadcrumbs?: boolean;
  currentPage?: string;
}

const Navigation = ({ showBreadcrumbs = false, currentPage = "" }: NavigationProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Fetch notification count (pending requests)
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) return;
      
      const { count, error } = await supabase
        .from("swap_requests")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", currentUser.id)
        .eq("status", "pending");
        
      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }
      
      setNotificationCount(count || 0);
    };
    
    fetchNotifications();
    
    // Set up real-time subscription for new requests
    const subscription = supabase
      .channel('public:swap_requests')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'swap_requests',
        filter: `receiver_id=eq.${currentUser?.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-4 h-4 mr-2" /> },
    { 
      name: "Requests", 
      path: "/requests", 
      icon: <Bell className="w-4 h-4 mr-2" />,
      badge: notificationCount > 0 ? notificationCount : undefined
    },
    { name: "Messages", path: "/messages", icon: <MessageCircle className="w-4 h-4 mr-2" /> },
    { name: "Profile", path: "/profile", icon: <User className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header className="glass-primary sticky top-0 z-10 backdrop-blur-xl">
      <div className="container-windsurf mx-auto">
        <div className="flex justify-between items-center py-4 relative">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 glass-accent rounded-lg flex items-center justify-center float-animation">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              <Link to="/" className="text-xl font-medium text-heading hover:text-accent transition-colors duration-200">SkillSwap Platform</Link>
            </div>
            
            {showBreadcrumbs && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-body">
                <Link to="/dashboard" className="hover:text-accent transition-colors duration-200">Home</Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-heading">{currentPage}</span>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link to={item.path} key={item.path}>
                  <Button 
                    variant={location.pathname === item.path ? "default" : "ghost"} 
                    size="sm" 
                    className={`relative ${location.pathname === item.path ? 'glass-accent text-accent-foreground' : 'glass-secondary text-body hover:text-heading'} focus-ring`}
                  >
                    {item.icon}
                    {item.name}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass-primary text-body hover:text-heading focus-ring" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full glass-secondary focus-ring">
                  <div className="w-10 h-10 glass-accent rounded-full flex items-center justify-center overflow-hidden">
                    {currentUser?.avatar_url ? (
                      <img 
                        src={currentUser.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-accent-foreground" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-primary border-none p-2 shadow-lg">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/requests')}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Requests</span>
                  {notificationCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/messages')}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            {notificationCount > 0 && (
              <div className="mr-4 relative">
                <Link to="/requests">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                </Link>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-600" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link 
                  to={item.path} 
                  key={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button 
                    variant={location.pathname === item.path ? "default" : "ghost"} 
                    size="sm" 
                    className="w-full justify-start relative"
                  >
                    {item.icon}
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
            
            <div className="mt-4 pt-4 border-t flex items-center">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                {currentUser?.avatar_url ? (
                  <img 
                    src={currentUser.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{currentUser?.full_name || "User"}</p>
                <p className="text-sm text-slate-500">{currentUser?.email || ""}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
