import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, X } from "lucide-react";
import { io } from "socket.io-client";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, setUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isChatSelected, setIsChatSelected] = useState(false);

  useEffect(() => {
    // Get the initial users list when component mounts
    getUsers();

    // Set up the socket connection
    const socket = io("http://localhost:3002");

    // Listen for new user creation
    socket.on("newUser", (newUser) => {
      // Update the users state with the new user
      setUsers((prevUsers) => [...prevUsers, newUser]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [getUsers, setUsers]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsChatSelected(true);
  };

  const handleChatClose = () => {
    setSelectedUser(null);
    setIsChatSelected(false);
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className={`h-full ${isChatSelected ? 'w-20' : 'w-25'} lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200`}
    >
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 lg:flex items-left gap-2">
          <label className="cursor-pointer flex items-center gap-1">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-xs sm:text-xm">Show online only</span>
          </label>
          <p className="sm:text-xs text-zinc-500">({onlineUsers.length - 1} online)</p>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleUserClick(user)}
            className={`
              w-full p-3 flex flex-col items-center lg:flex-row lg:items-start gap-2
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info */}
            <div className="text-center lg:text-left min-w-0">
              <div className="text-[10px] md:text-base lg:text-lg truncate">{user.fullName}</div>
              <div className="text-xs sm:text-sm text-zinc-400 hidden lg:block">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {/* {isChatSelected && (
        <div className="absolute top-5 right-8">
          <button onClick={handleChatClose}>
            <X />
          </button>
        </div>
      )} */}
    </aside>
  );
};

export default Sidebar;