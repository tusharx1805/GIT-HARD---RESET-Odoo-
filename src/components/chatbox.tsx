import { useEffect, useState } from "react";
import axios from "axios";

const ChatBox = ({ swapId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  const fetchMessages = async () => {
    const res = await axios.get(`/api/messages/${swapId}`);
    setMessages(res.data as any[]);
  };

  const sendMessage = async () => {
    if (!msg.trim()) return;
    await axios.post(`/api/messages`, {
      message: msg,
      receiverId,
      swapId,
    });
    setMsg("");
    fetchMessages();
  };

  useEffect(() => {
    if (swapId) fetchMessages();
  }, [swapId]);

  return (
    <div>
      <div className="message-list">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender_id === receiverId ? 'from-them' : 'from-you'}`}>
            {m.message}
          </div>
        ))}
      </div>
      <div>
        <input value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
