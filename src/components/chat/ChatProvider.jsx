"use client";

import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  ChannelList,
  useChannelStateContext,
  useChatContext,
  Avatar,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import { useEffect, useRef, useState } from "react";
import { userChatStore } from "@/store/userChatStore";
import { useLoaderStore } from "@/store/loaderStore";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function ChatProvider({ user }) {
  const chatClientRef = useRef(null);
  const [selectedChannel, setChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClientReady, setIsClientReady] = useState(false);

  // const chatPartner = userChatStore((state) => state.chatPartner);
  const { chatPartner, resetChatPartner } = userChatStore(); 
  const {loading, startLoading, stopLoading} = useLoaderStore(); 
  
  console.log(chatPartner);
  // Resize handling (client-only)
  useEffect(() => {
    const handleResize = () => {
      console.log("Resizing window...");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    startLoading("Initializing chat...");
    if (!user || !chatPartner) return;
    const initChat = async () => {
      try {
        
        if (!chatClientRef.current) {
          chatClientRef.current = StreamChat.getInstance(apiKey);
        }

        const chatClient = chatClientRef.current;

        // 1. Create user(s)
        await fetch("/api/chat/create-user", {
          method: "POST",
          body: JSON.stringify({ id: user.id, name: user.name }),
        });

        if (chatPartner?.id && chatPartner?.name) {
          await fetch("/api/chat/create-user", {
            method: "POST",
            body: JSON.stringify({
              id: chatPartner.id,
              name: chatPartner.name,
            }),
          });
        }

        // 2. Get token
        const res = await fetch("/api/chat/token", {
          method: "POST",
          body: JSON.stringify({ id: user.id, name: user.name }),
        });

        const { token } = await res.json();

        // 3. Connect user
        await chatClient.connectUser({ id: user.id, name: user.name }, token);

        // 4. Create or get channel
        const channelId = chatPartner?.id
          ? `chat-${[user.id, chatPartner.id].sort().join("-")}`
          : `solo-${user.id}`;

        const newChannel = chatClient.channel("messaging", channelId, {
          members: chatPartner?.id ? [user.id, chatPartner.id] : [user.id],
        });

        await newChannel.watch();
        setChannel(newChannel);
        setIsClientReady(true);
      } catch (err) {
        console.error("Error initializing Stream Chat:", err);
      }
    };

    initChat();  
    
  }, [user, chatPartner]);

  useEffect(() => {
    startLoading("Initializing chat...");
    if (!user?.id || !isClientReady) return;

    const fetchChannels = async () => {
      try {
        const chatClient = chatClientRef.current;
        const filters = { members: { $in: [user.id] } };
        const queriedChannels = await chatClient.queryChannels(
          filters,
          { last_message_at: -1 },
          { watch: true, state: true }
        );

        if (searchQuery) {
          const lowerSearch = searchQuery.toLowerCase();
          const filtered = queriedChannels.filter((channel) => {
            const otherMember = Object.values(channel.state?.members || {}).find(
              (m) => m.user.id !== user.id
            );
            return otherMember?.user?.name?.toLowerCase().includes(lowerSearch);
          });
          setChannels(filtered);
        } else {
          setChannels(queriedChannels);
        }
        stopLoading();
      } catch (err) {
        console.error("Error fetching channels:", err);
        stopLoading();
      }
    };

    fetchChannels(); 
  }, [isClientReady, searchQuery, user]);

  
  useEffect(() => {
    return () => {
      chatClientRef.current?.disconnectUser?.();
      resetChatPartner();
    };
  }, []);
  
  // UI COMPONENTS 
  function CustomPreview({ status = "searching", channel: thisChannel, setActiveChannel, activeChannel }) {
    const { client } = useChatContext();
    const members = Object.values(thisChannel?.state?.members || {});
    const otherMember = members.find((m) => m.user.id !== client.user.id);
    const isActive = activeChannel?.id === thisChannel?.id;

    return (
      <div
        onClick={() => setActiveChannel(thisChannel)}
        style={{
          padding: "10px",
          cursor: "pointer",
          borderBottom: "1px solid #ccc",
          backgroundColor: isActive ? "#e6f7ff" : "transparent",
          fontWeight: isActive ? "bold" : "normal",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          {status !== "searching" && (
            <Avatar image={otherMember?.user?.image} name={otherMember?.user?.name} size={64} />
          )}
          <span>{otherMember?.user?.name || "Unnamed"}</span>
        </div>
      </div>
    );
  }

  function CustomChannelHeader() {
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();
    const members = Object.values(channel?.state?.members || {});
    const otherMember = members.find((m) => m.user.id !== client.user.id);
    const isOnline = otherMember?.user?.online;

    return (
      <div className="str-chat__channel-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <div className="d-flex align-items-center">
          <div className="back-icon" onClick={() => setChannel(null)}>←</div>
          <div style={{ position: "relative" }}>
            <Avatar image={otherMember?.user?.image} name={otherMember?.user?.name} size={64} />
            <div
              style={{
                position: "absolute",
                background: isOnline ? "green" : "red",
                right: 0,
                bottom: "-3px",
                borderRadius: "10px",
                border: "2px solid white",
                width: "12px",
                height: "12px",
              }}
            />
          </div>
          <div className="ml10">
            <p className="mb-0 bold">{otherMember?.user?.name || "Chat"}</p>
            <span className={`ml-2 ${isOnline ? "text-success" : "text-danger"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Loading + Empty UI
  console.log("Loading state:", loading.state);
  if (loading.state) {
    return <div className="chat-wrapper"><p className="m-auto">{loading.message}</p></div>;
  }

  if (channels?.length === 0 && searchQuery === "") {
    return <div className="chat-wrapper"><p className="m-auto">No chat yet. Nobody reached out to you yet.</p></div>;
  }

  // Main Chat UI
  return (
    <div className="chat-wrapper">
      <Chat client={chatClientRef.current} theme="messaging light">
        <div className="chat-body">
          <div className="chat-sidebar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search clients..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="search-icon"></div>
            </div>

            <div>
              {channels.length > 0 && searchQuery !== "" && isClientReady && channels.map((channel) => (
                <CustomPreview
                  key={channel.id}
                  channel={channel}
                  setActiveChannel={setChannel}
                  activeChannel={selectedChannel}
                />
              ))}
              {isClientReady && searchQuery === "" && (
                <ChannelList
                  filters={{ members: { $in: [user.id] } }}
                  sort={{ last_message_at: -1 }}
                  Preview={(props) => (
                    <CustomPreview
                      status="displaying"
                      {...props}
                      setActiveChannel={setChannel}
                      activeChannel={selectedChannel}
                    />
                  )}
                />
              )}
              {channels.length === 0 && searchQuery !== "" && (
                <div className="no-results text-muted">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          <div className="chat-content">
            {selectedChannel ? (
              <Channel channel={selectedChannel}>
                <Window>
                  <CustomChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </Chat>
    </div>
  );
}
