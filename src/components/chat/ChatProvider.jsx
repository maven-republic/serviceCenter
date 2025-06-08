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
import { useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const chatClient = StreamChat.getInstance(apiKey);

// Replace this with the actual second user or agent ID
// const OTHER_USER_ID = "support-agent-12000";

export default function ChatProvider({ user }) {
  const [selectedChannel, setChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenWidth, setScreenWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isClientReady, setIsClientRedy] = useState(false);
  let otherUserData = {
    id: undefined,
    name: undefined,
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768);
      console.log("channels: ", channels);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  useEffect(() => {
    async function initChat() {
      try {
        // 1. Upsert both users
          await fetch("/api/chat/create-user", {
            method: "POST",
            body: JSON.stringify({ id: user.id, name: user.name }),
          });

          if (otherUserData?.id && otherUserData?.name) {
            await fetch("/api/chat/create-user", {
              method: "POST",
              body: JSON.stringify({
                id: otherUserData.id,
                name: otherUserData.name
              }),
            }) 
          }

        // 2. Get token
        const res = await fetch("/api/chat/token", {
          method: "POST",
          body: JSON.stringify({ id: user.id, name: user.name }),
        });
        const { token } = await res.json();
        console.log("Stream chat token:", token);
        // 3. Connect user
        await chatClient.connectUser({ id: user.id, name: user.name }, token);

        // 4. Create or fetch consistent channel
        let channelId;
        if (otherUserData?.id) {
          const sortedIdsc = [user.id, otherUserData?.id].sort().join("-");
          channelId = `chat-${sortedIdsc}`;
        } else {
          channelId = `solo-${user.id}`;
        }
        
        const newChannel = chatClient.channel("messaging", channelId, {
          members: (otherUserData?.id && otherUserData?.name) ? [user.id, otherUserData.id] : [user.id],
        });

        await newChannel.watch();
        
        setChannel(newChannel);
        setIsClientRedy(true);
      } catch (error) {
        console.error("Stream chat error:", error);
      }
    }
    
    let temp = sessionStorage.getItem("otherUserData");
    otherUserData = JSON.parse(temp);

    initChat();
    return () => {
      chatClient.disconnectUser();
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !isClientReady) return;

    const fetchChannels = async () => {
      const filters = { members: { $in: [user.id] } };
      const queriedChannels = await chatClient.queryChannels(
        filters,
        { last_message_at: -1 },
        {
          watch: true,
          state: true,
        }
      );

      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        const filtered = queriedChannels.filter((channel) => {
          const otherMember = Object.values(channel.state.members).find(
            (m) => m.user.id !== user.id
          );
          return otherMember?.user?.name?.toLowerCase().includes(lowerSearch);
        });
        setChannels(filtered);
      } else {
        setChannels(queriedChannels);
      }
    };
    if (isClientReady) fetchChannels();
  }, [isClientReady, searchQuery, user]);

  function CustomPreview({
    status = "searching",
    channel: thisChannel,
    setActiveChannel,
    activeChannel,
  }) {
    const { client } = useChatContext();
    const members = Object.values(thisChannel.state.members);
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
          {status != "searching" && <Avatar
            image={otherMember?.user?.image}
            name={otherMember?.user?.name}
            size={64}
          />}
          <span>{otherMember?.user?.name || "Unnamed"}</span>
        </div>
      </div>
    );
  }

  function CustomChannelHeader() {
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();
    const members = Object.values(channel.state.members);
    const otherMember = members.find((m) => m.user.id !== client.user.id);
    const isOnline = otherMember?.user?.online;

    return (
      <div className="str-chat__channel-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <div className="d-flex align-items-center">
          <div className="back-icon" onClick={() => setChannel(null)}></div>
          <div style={{ position: "relative" }}>
            <Avatar
              image={otherMember?.user?.image}
              name={otherMember?.user?.name}
              size={64}
            />
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
            <span
              className={`ml-2 ${isOnline ? "text-success" : "text-danger"}`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  console.log("channels.length: ", channels?.length);
  if (channels?.length === 0 && searchQuery === "") return <div className="chat-wrapper"> <p className="m-auto">No chat yet. Nobody reached out to you yet.</p> </div>;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient} theme="messaging light">
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
            {channels.length > 0 && searchQuery != "" && isClientReady && channels.map((channel) => (
                <CustomPreview
                  key={channel.id}
                  channel={channel}
                  setActiveChannel={setChannel}
                  activeChannel={selectedChannel}
                />
              )
            )}
            {isClientReady && searchQuery === "" && <ChannelList
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
            }
            {channels.length == 0 && searchQuery != "" && (
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
