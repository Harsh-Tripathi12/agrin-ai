import { useState, useRef, useEffect } from "react";
import { askAssistant } from "../services/api";
import { SendHorizontal, Sparkles } from "lucide-react";

export default function FarmerAssistant() {
    const language = localStorage.getItem("agrin_language") || "en";

    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    async function sendMessage(event) {
        event?.preventDefault();

        const text = question.trim();

        if (!text || loading) {
            return;
        }

        setQuestion("");
        setError("");

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                text,
            },
        ]);

        try {
            setLoading(true);

            const response = await askAssistant(text, language);

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    text: response.data.answer,
                },
            ]);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const suggestions = [
        "When to irrigate wheat?",
        "Best fertilizer for rice?",
        "Pest control tips",
        "Weather impact on crops"
    ];

    const handleSuggestionClick = (text) => {
        setQuestion(text);
    };

    return (
        <div className="min-h-screen bg-green-50 px-4 py-6 flex flex-col">
            <div className="mx-auto flex w-full max-w-3xl flex-col flex-1">
                <div className="mb-6 text-center">
                    <p className="text-sm font-bold tracking-wider text-green-700 uppercase flex items-center justify-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        AgriN AI
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
                        Farmer Assistant 🤖
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Ask questions about your crops, farm, weather or farming practices.
                    </p>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center text-center p-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-6">
                                    <span className="text-4xl">🌾</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    How can I help your farm today?
                                </h2>
                                <p className="mt-2 text-gray-500 max-w-md">
                                    I'm your AI farming assistant. Ask me anything about crop management, soil health, or pest control.
                                </p>
                                
                                <div className="mt-8 flex flex-wrap justify-center gap-2">
                                    {suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                                    message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                                        🌱
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                                        message.role === "user"
                                            ? "rounded-2xl rounded-br-md bg-green-600 text-white"
                                            : "rounded-2xl rounded-bl-md bg-gray-50 border border-gray-100 text-gray-800"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex w-full justify-start animate-in fade-in duration-300">
                                <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                                    🌱
                                </div>
                                <div className="flex max-w-[85%] items-center rounded-2xl rounded-bl-md bg-gray-50 border border-gray-100 px-5 py-4 shadow-sm">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-100 bg-white p-4">
                        {error && (
                            <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-100">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={sendMessage} className="relative flex items-center">
                            <input
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder={
                                    language === "hi"
                                        ? "अपना सवाल पूछें..."
                                        : "Ask your farming question..."
                                }
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-5 pr-14 py-4 text-sm outline-none transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white transition-all hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <SendHorizontal className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}