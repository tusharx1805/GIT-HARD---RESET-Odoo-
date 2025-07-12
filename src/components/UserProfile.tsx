import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "./LogoutButton";

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-base">{user?.email}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="text-base break-all">{user?.id}</p>
          </div>
          
          {user?.user_metadata?.full_name && (
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-base">{user.user_metadata.full_name}</p>
            </div>
          )}
          
          {user?.user_metadata?.skills && (
            <div>
              <p className="text-sm font-medium text-gray-500">Skills</p>
              <p className="text-base">{user.user_metadata.skills}</p>
            </div>
          )}
          
          <div className="pt-4">
            <LogoutButton variant="destructive" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
