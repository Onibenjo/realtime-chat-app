import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

export interface User {
  username: string;
  roomId: string | null;
}

type OnlineUsersProps = {
  usersInCurrentRoom: User[];
  username: string;
};

export const OnlineUsers = ({
  usersInCurrentRoom,
  username,
}: OnlineUsersProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Online Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {usersInCurrentRoom.length === 0 ? (
          <p className="text-gray-500">No users in this room</p>
        ) : (
          <div className="space-y-2">
            {usersInCurrentRoom.map((user, index) => (
              <div key={user.username}>
                <div className="flex items-center space-x-2 py-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>
                    {user.username === username ? "You" : user.username}
                  </span>
                </div>
                {index < usersInCurrentRoom.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
