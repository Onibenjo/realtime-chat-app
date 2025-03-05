"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { Sidebar } from "./chat/Sidebar";
import { OnlineUsers, User } from "./chat/OnlineUsers";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  roomId: string;
}

interface Room {
  id: string;
  name: string;
  createdBy: string;
}

export default function ChatInterface({ username }: { username: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useNavigate();

  const setCookie = useCookies(["user"])[1];

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = "http://localhost:5500";
    const newSocket = io(socketUrl, {
      auth: { username },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    if (!socket) return;

    // Get initial rooms
    socket.emit("getRooms");

    // when new message enters
    socket.on("message", (message: Message) => {
      setMessages((prev) => {
        const roomMessages = prev[message.roomId] || [];
        return {
          ...prev,
          [message.roomId]: [...roomMessages, message],
        };
      });
    });

    socket.on("roomList", (roomList: Room[]) => {
      setRooms(roomList);

      // If no current room is selected and rooms exist, select the first one
      if (!currentRoom && roomList.length > 0) {
        setCurrentRoom(roomList[0].id);
        socket.emit("joinRoom", roomList[0].id);
      }
    });

    // Handle room history
    socket.on(
      "roomHistory",
      ({ roomId, history }: { roomId: string; history: Message[] }) => {
        setMessages((prev) => ({
          ...prev,
          [roomId]: history,
        }));
      }
    );

    // Handle online users update
    socket.on("onlineUsers", (users: User[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("message");
      socket.off("roomList");
      socket.off("roomHistory");
      socket.off("onlineUsers");
    };
  }, [socket, currentRoom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !currentRoom || !socket) return;

    socket.emit("sendMessage", {
      text: message,
      roomId: currentRoom,
    });

    setMessage("");
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket) return;

    setCurrentRoom(roomId);
    socket.emit("joinRoom", roomId);
  };

  const handleLogout = () => {
    setCookie("user", "");
    if (socket) socket.disconnect();
    router("/");
  };

  // Get users in current room
  const usersInCurrentRoom = onlineUsers.filter(
    (user) => user.roomId === currentRoom
  );

  // Get current room name
  const currentRoomName =
    rooms.find((room) => room.id === currentRoom)?.name || "Loading...";

  if (!socket) return null;

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      <Sidebar
        username={username}
        rooms={rooms}
        currentRoom={currentRoom}
        handleLogout={handleLogout}
        handleJoinRoom={handleJoinRoom}
        socket={socket}
      />

      {/* Main chat area */}
      <Tabs defaultValue="chat" className="w-full">
        <div className="flex-1 flex flex-col h-full">
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{currentRoomName}</h1>
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="users">
                  Users
                  <Badge variant="secondary" className="ml-2">
                    {usersInCurrentRoom.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <TabsContent value="chat" className="flex-1 overflow-hidden p-4">
                <Card className="h-full flex flex-col">
                  <CardContent className="flex-1 overflow-hidden p-4">
                    <ScrollArea className="h-full pr-4">
                      {currentRoom && messages[currentRoom]?.length ? (
                        messages[currentRoom].map((msg) => (
                          <div
                            key={msg.id}
                            className={`mb-4 ${
                              msg.username === username
                                ? "flex flex-col items-end"
                                : "flex flex-col items-start"
                            }`}>
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                msg.username === username
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                              <div className="text-xs mb-1">
                                {msg.username === username
                                  ? "You"
                                  : msg.username}
                              </div>
                              <div>{msg.text}</div>
                              <div className="text-xs mt-1 opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          {currentRoom
                            ? "No messages yet. Start the conversation!"
                            : "Select a room to start chatting"}
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </ScrollArea>
                  </CardContent>
                  <div className="p-4 border-t border-gray-200">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={!currentRoom}
                      />
                      <Button type="submit" disabled={!currentRoom}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="h-full p-4">
                <OnlineUsers
                  username={username}
                  usersInCurrentRoom={usersInCurrentRoom}
                />
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
