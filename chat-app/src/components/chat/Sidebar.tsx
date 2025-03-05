import { UserCircle, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Socket } from "socket.io-client";

interface Room {
  id: string;
  name: string;
  createdBy: string;
}

type SidebarProps = {
  username: string;
  handleLogout: () => void;
  rooms: Room[];
  socket: Socket;
  currentRoom: string | null;
  handleJoinRoom: (room: string) => void;
};
export const Sidebar = ({
  username,
  handleLogout,
  rooms,
  socket,
  currentRoom,
  handleJoinRoom,
}: SidebarProps) => {
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const handleCreateRoom = () => {
    if (!newRoomName.trim() || !socket) return;

    socket.emit("createRoom", newRoomName);
    setNewRoomName("");
    setIsCreateRoomOpen(false);
  };

  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCircle className="h-6 w-6 text-gray-500" />
            <span className="font-medium">{username}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat Rooms</h2>
          <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new room</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="room-name">Room name</Label>
                  <Input
                    id="room-name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateRoom}>Create Room</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-1">
            {rooms.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                No rooms available. Create one!
              </p>
            ) : (
              rooms.map((room) => (
                <Button
                  key={room.id}
                  variant={currentRoom === room.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleJoinRoom(room.id)}>
                  {room.name}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
