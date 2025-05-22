'use client';

import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  ChannelList,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { useEffect, useState } from 'react';
import { useChannelStateContext, useChatContext, Avatar } from 'stream-chat-react';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const chatClient = StreamChat.getInstance(apiKey);

// Replace this with the actual second user or agent ID
const OTHER_USER_ID = '84aa524d-d52b-4d0a-ae88-fc3f6b133501';

export default function ChatProvider({ user }) {
  const [selectedChannel, setChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(false);  

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    async function initChat() {
      try {
        // 1. Upsert both users
        await Promise.all([
          fetch('/api/chat/create-user', {
            method: 'POST',
            body: JSON.stringify({ id: user.id, name: user.name }),
          }),
          fetch('/api/chat/create-user', {
            method: 'POST',
            body: JSON.stringify({ id: OTHER_USER_ID, name: 'Support Agent yam' }),
          }),
        ]);

        // 2. Get token
        const res = await fetch('/api/chat/token', {
          method: 'POST',
          body: JSON.stringify({ id: user.id, name: user.name }),
        });
        const { token } = await res.json();

        // 3. Connect user
        await chatClient.connectUser({ id: user.id, name: user.name }, token);

        // 4. Create channel
        const newChannel = chatClient.channel('messaging', {
          members: [user.id, OTHER_USER_ID],
        });

        await newChannel.watch();
        setChannel(newChannel);
      } catch (error) {
        console.error('Stream chat error:', error);
      }
    }

    initChat();

    return () => {
      chatClient.disconnectUser();
    };
  }, []);


  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchChannels = async () => {
      const filters = {
        members: { $in: [user.id] },
      };
  
      const queriedChannels = await chatClient.queryChannels(filters, { last_message_at: -1 }, {
        watch: true,
        state: true,
      });
  
      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        const filtered = queriedChannels.filter(channel => {
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
  
    fetchChannels();
  }, [searchQuery, user]);
  

  if (!selectedChannel) return <p className="text-center mt-5">Loading chat...</p>;





  function CustomPreview({ channel: thisChannel, setActiveChannel, activeChannel }) {
    const isActive = activeChannel?.id === thisChannel?.id;
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();

    const members = Object.values(thisChannel.state.members);
    const otherMember = members.find((m) => m.user.id !== client.user.id);
    const isOnline = otherMember?.user?.online;
    const image = otherMember?.user?.image || undefined;
  
    const handleClick = () => {
      setActiveChannel(thisChannel);
    };
  
    return (
      <div
        onClick={handleClick}
        style={{
          padding: '10px',
          cursor: 'pointer',
          borderBottom: '1px solid #ccc',
          backgroundColor: isActive ? '#e6f7ff' : 'transparent',
          fontWeight: isActive ? 'bold' : 'normal',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <Avatar image={image} name={otherMember?.user.name} size={64} />
          <span>
            {
              Object.values(thisChannel.state.members).find(
                (member) => member.user.id !== thisChannel.getClient().userID
              )?.user.name || 'Unnamed'
            }
          </span>
        </div>
      </div>
    );
  }
  



  // function CustomPreview({ channel, setActiveChannel }) {
  //   const handleClick = () => {
  //     setActiveChannel(channel);
  //   };
  // // console.log('activeChannel', activeChannel);
  //   // const isActive = activeChannel?.id === channel?.id;
  
  //   return (
  //     <div
  //       onClick={handleClick}
  //       style={{
  //         padding: '10px',
  //         cursor: 'pointer',
  //         borderBottom: '1px solid #ccc',
  //         backgroundColor: isActive ? '#f0f0f0' : 'transparent',
  //         fontWeight: isActive ? 'bold' : 'normal',
  //       }}
  //     >
  //       <div className="d-flex align-items-center gap-2"> 
  //         <span>
  //           {
  //             Object.values(channel.state.members).find(
  //               (member) => member.user.id !== channel.getClient().userID
  //             )?.user.name || 'Unnamed'
  //           }
  //         </span>
  //       </div>
  //     </div>
  //   );
  // }

  


  // function CustomPreview({ channel, setActiveChannel }) {
  //   const handleClick = () => {
  //     setActiveChannel(channel); // this sets the channel you clicked on
  //   };
    
  //   // Extract the member list excluding the current user
  //   const members = Object.values(channel.state.members || {});
  //   const otherMember = members.find((m) => m.user.id !== user.id);
  //   const displayName = otherMember?.user.name || 'Unnamed User';
    
  //   console.log('channel', channel);
  //   console.log('user', user.id);
  //   return (
  //     <div onClick={handleClick} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ccc', backgroundColor: selectedChannel?.id === channel?.cid ? '#f1f1f1' : 'transparent', }}>
  //       {displayName}
  //     </div>
  //   );
  // }



  function CustomChannelHeader() {
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();

    const members = Object.values(channel.state.members);
    const otherMember = members.find((m) => m.user.id !== client.user.id);
    const isOnline = otherMember?.user?.online;
    const image = user?.image || undefined;

    return (
      <div className="str-chat__channel-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <div className="d-flex align-items-center">
          <svg
            onClick={() => setChannel(null)}
            className="back-icon"
            fill="#000000"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path d="M33.934,54.458l30.822,27.938c0.383,0.348,0.864,0.519,1.344,0.519c0.545,0,1.087-0.222,1.482-0.657 c0.741-0.818,0.68-2.083-0.139-2.824L37.801,52.564L64.67,22.921c0.742-0.818,0.68-2.083-0.139-2.824 c-0.817-0.742-2.082-0.679-2.824,0.139L33.768,51.059c-0.439,0.485-0.59,1.126-0.475,1.723 C33.234,53.39,33.446,54.017,33.934,54.458z" />
            </g>
          </svg> 
          <div style={{ position: "relative" }}> 
            
            <Avatar image={image} name={otherMember?.user.name} size={64} />
            <div style={{ 
                  position: "absolute",
                  background: "red",
                  right: 0,
                  bottom: "-3px",
                  borderRadius: "10px",
                  border: "2px solid white",
                  width: "12px",
                  height: "12px"
              }}></div>
          </div>
          <div className='ml10'>
            <p className='mb-0 bold'>
              {otherMember?.user.name || 'Chat'} 
            </p>
            <span className={`ml-2 ${isOnline ? 'text-success' : 'text-danger'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div> 
        </div> 
      </div>
    );
  }
  
  return (
    <div className="chat-wrapper">
      <Chat client={chatClient} theme="messaging light">
        <div className="chat-body">
          <div className="chat-sidebar"> 
            <div class="search-container">
              <input
                type="text"
                placeholder="Search clients..."
                class="search-input"
                value=""
                oninput="handleSearch(this.value)"
              />
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="#888"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div>
              {channels.length > 0 ? channels.map((channel) => (
                <CustomPreview
                  key={channel.id}
                  channel={channel}
                  setActiveChannel={setChannel}
                  activeChannel={selectedChannel}
                />
              )) : (
                <ChannelList
                  filters={{ members: { $in: [user.id] } }}
                  sort={{ last_message_at: -1 }}
                  Preview={(props) => (
                    <CustomPreview
                      {...props}
                      setActiveChannel={setChannel}
                      activeChannel={selectedChannel}
                    />
                  )}
                />
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

    // <div className="container-fluid">
    //   <Chat client={chatClient} theme="messaging light">
    //     <div className="row p-2" style={{ height: '80vh', backgroundColor: '#f8f9fa' }}>
    //       {/* Sidebar */}
    //       <div className="col-md-4 p-0 overflow-auto rounded">
    //       <ChannelList
    //         filters={{ members: { $in: [user.id] } }}
    //         sort={{ last_message_at: -1 }}
    //         Preview={(props) => (
    //           <CustomPreview
    //             {...props}
    //             setActiveChannel={setChannel}
    //             activeChannel={selectedChannel} // ← this is key
    //           />
    //         )}
    //       />

    //       </div>

    //       {/* Chat window */}
    //       <div className="col-md-8 d-flex flex-column" style={{ borderRadius: '30px' }}>
    //         {selectedChannel ? (
    //           <div style={{ borderRadius: '30px' }}>
    //           <Channel channel={selectedChannel}>
    //             <Window>
    //               <CustomChannelHeader />
    //               <MessageList />
    //               <MessageInput />
    //             </Window>
    //           </Channel></div>
    //         ) : (
    //           <div className="d-flex justify-content-center align-items-center h-100 text-muted">
    //             Select a conversation to start chatting
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   </Chat>
    // </div>
  );
}
