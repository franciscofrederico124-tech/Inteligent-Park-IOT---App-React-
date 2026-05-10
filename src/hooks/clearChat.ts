
interface ClearChatProps {
    setMessages: (messages: any[]) => void;
    setShowTitle: (show: boolean) => void;
}

export default function clearChat({ setMessages, setShowTitle }: ClearChatProps): void {
    localStorage.removeItem("chat_history");
    
    setMessages([]);
    setShowTitle(true);
}
