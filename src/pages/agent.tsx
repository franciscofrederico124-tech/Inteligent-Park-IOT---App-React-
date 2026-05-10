import React, { useState, useEffect, useRef } from "react";
import "../style/assistent.css";
import url from "../hooks/url";
import CheckSesssion from "../services/auth/checkSession";
import clearChat from "../hooks/clearChat";

function AssistenteGray() {
    CheckSesssion();
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

    // Função separada para a lógica de envio (já que não há mais o submit automático)
    const handleSendMessage = async () => {
        if (!question.trim() || isLoading) return;

        const currentQuestion = question;
        const newMessages = [...messages, { role: "user", content: currentQuestion }] as const;

        setMessages(newMessages);
        setIsLoading(true);
        setQuestion("");

        try {
            let compressedSummary = "";
            if (newMessages.length > 12) {
                const olderMessages = newMessages.slice(0, -12);
                try {
                    const contextRes = await fetch(url.apiBase + "/assistent/ask/context", {
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

            const response = await fetch(url.apiBase + "/assitent/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: currentQuestion,
                    history: newMessages.slice(-12),
                    summary: compressedSummary
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

    // Detectar tecla Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    const formatMessage = (text: string) => {
        const targetUrl = "http://wofproject.netlify.app";
        if (text.toLowerCase().includes(targetUrl)) {
            const parts = text.split(new RegExp(`(${targetUrl})`, 'gi'));
            return parts.map((part, i) =>
                part.toLowerCase() === targetUrl
                    ? <a key={i} href="#" onClick={RedirectToOficialPage} className="chat-link">{part}</a>
                    : part
            );
        }
        return text;
    };

    return (
        <div className="gray-layout">
            <header className="top-bar">
                <div className="header-content">
                    <h1 className="header-text">
                        Agente de IA <i className="bi bi-robot header-icon"></i>
                    </h1>
                </div>
            </header>

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
                        <div className="bubble assistant loading">Processando...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Refatorado: De form para div */}
                <div className="gray-form">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown} // Listener para o Enter
                        placeholder="Digite sua pergunta..."
                        disabled={isLoading}
                    />
                    <button 
                        type="button" 
                        onClick={handleSendMessage} // Clique manual
                        disabled={isLoading}
                    >
                        {isLoading ? "..." : "Enviar"}
                    </button>
                    
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => clearChat({ setMessages, setShowTitle })}
                            className="btn-clear-chat"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AssistenteGray;