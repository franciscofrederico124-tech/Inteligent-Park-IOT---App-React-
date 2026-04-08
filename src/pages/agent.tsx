import React, { useState, useEffect, useRef } from "react";
import "../style/assistent.css";

const AssistenteGray: React.FC = () => {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(() => {
        const saved = localStorage.getItem("chat_history");
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showTitle, setShowTitle] = useState(messages.length === 0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Mantemos o localStorage com até 30 mensagens para ter o que resumir depois
        const historyLimit = 30; 
        const limitedMessages = messages.slice(-historyLimit);
        localStorage.setItem("chat_history", JSON.stringify(limitedMessages));
        scrollToBottom();
        if (messages.length > 0) setShowTitle(false);
    }, [messages]);

    const RedirectToOficialPage = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = "http://wofProject.netlify.app";
    }

    const formatMessage = (text: string) => {
        const url = "http://wofproject.netlify.app";
        if (text.toLowerCase().includes(url)) {
            const parts = text.split(new RegExp(`(${url})`, 'gi'));
            return parts.map((part, i) => 
                part.toLowerCase() === url 
                    ? <a key={i} href="#" onClick={RedirectToOficialPage} className="chat-link">{part}</a> 
                    : part
            );
        }
        return text;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoading) return;

        const newMessages = [...messages, { role: "user", content: question }] as const;
        setMessages(newMessages);
        setIsLoading(true);
        setQuestion("");

        try {
            let compressedSummary = "";

            // LÓGICA DE CONTEXTO: Se tiver mais de 12 mensagens, resume as antigas
            if (newMessages.length > 12) {
                const olderMessages = newMessages.slice(0, -12);
                try {
                    const contextRes = await fetch("http://localhost:3000/ask/context", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ historyToCompress: olderMessages })
                    });
                    const contextData = await contextRes.json();
                    compressedSummary = contextData.summary;
                } catch (err) {
                    console.error("Erro ao extrair contexto:", err);
                }
            }

            // ENVIO PARA A API PRINCIPAL
            const response = await fetch("http://localhost:3000/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    question: question,
                    history: newMessages.slice(-12), // Últimas 12 intactas
                    summary: compressedSummary     // Resumo das anteriores
                })
            });

            const data = await response.json();
            const answer = data.answer || "Não consegui responder.";
            setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao conectar com o servidor." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if(window.confirm("Limpar todo o histórico?")) {
            localStorage.removeItem("chat_history");
            setMessages([]);
            setShowTitle(true);
        }
    };

    return (
        <div className="gray-layout">
            <main className="gray-main">
                <div className="gray-chat">
                    {showTitle && (
                        <div className="welcome-title">
                            <h1>Bem-vindo ao Ipi IA</h1>
                            <p>Tire suas dúvidas sobre o Inteligent Park IOT</p>
                        </div>
                    )}
                    
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`bubble ${msg.role}`}>
                            {formatMessage(msg.content)}
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="bubble assistant loading">Processando contexto...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="gray-input">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Digite sua pergunta..."
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "..." : "Enviar"}
                    </button>
                     {messages.length > 0 && (
                        <button type="button" onClick={clearChat} className="btn-clear-chat ">
                            Limpar
                        </button>
                    )}
                </form>
            </main>
        </div>
    );
};

export default AssistenteGray;
