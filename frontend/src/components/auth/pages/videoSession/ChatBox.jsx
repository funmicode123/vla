import 'stream-chat-react/dist/css/v2/index.css';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from 'stream-chat-react';
import { useEffect } from 'react';

const ChatBox = ({ chatClient, channel }) => {
  useEffect(() => {
    if (channel) {
      console.log('Channel state:', channel.state);

      const handleRead = (event) => {
        console.log('Message read by:', event.user.id);
      };
      channel.on('message.read', handleRead);

      channel
        .update({ config: { read_events: true } })
        .then(() => {
          console.log('Channel updated with read events');
        })
        .catch((error) => {
          console.error('Failed to update channel:', error);
          if (!channel.getConfig()?.read_events) {
            console.warn('Read events not enabled; manual configuration may be required.');
          }
        });

      return () => {
        channel.off('message.read', handleRead);
      };
    }
  }, [channel]);

  if (!chatClient || !channel) {
    return <div>Loading chat...</div>;
  }

  const CustomMessage = (props) => {
    const { message } = props;
    return (
      <div>
        <strong> ({message.user.email})</strong>: {message.text}
      </div>
    );
  };

  return (
    <Chat client={chatClient} theme="team light">
      <Channel channel={channel} Message={CustomMessage}>
        <Window>
          <ChannelHeader title={channel?.data.name || channel?.data.topic || 'No Topic'} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </Chat>
  );
};

export default ChatBox;