import { useEffect, useState } from "react";
import axios from "axios";

type Conversation = {
  id: number;
  partner_name: string;
  // add other properties if needed
};

const ConversationList = ({ onSelect }: { onSelect: (c: Conversation) => void }) => {
  const [convos, setConvos] = useState<Conversation[]>([]);

  useEffect(() => {
    axios.get<Conversation[]>("/api/swap-requests/accepted").then(res => {
      setConvos(res.data);
    });
  }, []);

  return (
    <div>
      {convos.map((c) => (
        <div key={c.id} onClick={() => onSelect(c)}>
          Chat with {c.partner_name}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
