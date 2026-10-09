import { useState, useRef, useEffect } from "react";
import { askAssistant } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import AiResponseFormatter from "../components/common/AiResponseFormatter";
import { SendHorizontal, Sparkles, Trash2, Bot, User, Sprout, CornerDownLeft } from "lucide-react";

export default function FarmerAssistant() {
    const { language, setLanguage } = useLanguage();
    const isHindi = language === "hi";

    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem("agrin_assistant_chat");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        try {
            sessionStorage.setItem("agrin_assistant_chat", JSON.stringify(messages));
        } catch { /* storage full */ }
    }, [messages, loading]);

    async function sendMessage(event) {
        event?.preventDefault();

        const text = question.trim();
        if (!text || loading) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setQuestion("");
        setError("");

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                text,
                time: timeStr,
            },
        ]);

        try {
            setLoading(true);
            const response = await askAssistant(text, language);

            if (response?.data?.answer) {
                setMessages((previous) => [
                    ...previous,
                    {
                        role: "assistant",
                        text: response.data.answer,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                ]);
            } else {
                throw new Error("Empty response received from assistant.");
            }
        } catch (err) {
            console.error("Assistant error:", err);
            setError(err.message || "Unable to get an answer right now. Please try again.");
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    const suggestions = isHindi ? [
        "गेहूं की सिंचाई कब करें?",
        "धान के लिए सबसे अच्छी खाद?",
        "कीट और रोग नियंत्रण के उपाय",
        "मौसम के अनुसार फसल की देखभाल"
    ] : [
        "When to irrigate wheat crop?",
        "Best fertilizer schedule for rice?",
        "Natural pest control tips",
        "Protect crops from high humidity"
    ];

    const handleSuggestionClick = (text) => {
        setQuestion(text);
        inputRef.current?.focus();
    };

    const clearChat = () => {
        setMessages([]);
        try {
            sessionStorage.removeItem("agrin_assistant_chat");
        } catch { /* ignore */ }
    };

    return (
        <div className="min-h-screen bg-[#f7faf5] px-4 py-6 md:px-6 flex flex-col">
            <div className="mx-auto flex w-full max-w-4xl flex-col flex-1">
                
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-green-800">
                            <Sparkles className="w-3 h-3 text-green-600" />
                            AgriN AI Farming Expert
                        </div>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">
                            Farmer Assistant 🤖
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600">
                            {isHindi
                                ? "अपनी फसल, मिट्टी, मौसम या खेती की समस्याओं पर सवाल पूछें।"
                                : "Ask questions about crop diseases, fertilizers, weather protection and soil health."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                        {/* Language quick switcher */}
                        <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setLanguage?.("en")}
                                className={`px-2.5 py-1 rounded-lg transition ${
                                    language === "en" ? "bg-white text-green-800 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage?.("hi")}
                                className={`px-2.5 py-1 rounded-lg transition ${
                                    language === "hi" ? "bg-white text-green-800 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                हिन्दी
                            </button>
                        </div>

                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={clearChat}
                                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
                                title="Clear conversation"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isHindi ? "साफ़ करें" : "Clear"}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Chat Box */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 min-h-[500px]">
                    
                    {/* Message Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                        {messages.length === 0 && (
                            <div className="flex h-full min-h-[350px] flex-col items-center justify-center text-center p-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 border border-green-100 text-green-600 mb-5 shadow-sm">
                                    <Sprout className="h-10 w-10" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isHindi ? "आज आपकी खेती में क्या मदद चाहिए?" : "How can I help your farm today?"}
                                </h2>
                                <p className="mt-2 text-sm text-gray-500 max-w-md">
                                    {isHindi
                                        ? "मैं आपका AI कृषि सलाहकार हूँ। फसल सुरक्षा, उर्वरक, खाद या पानी से जुड़ा कोई भी प्रश्न पूछें।"
                                        : "I am your AI agriculture partner. Ask about pest diagnosis, organic remedies, irrigation, or weather alerts."}
                                </p>
                                
                                <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-lg">
                                    {suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="rounded-xl border border-green-200 bg-green-50/70 px-3.5 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            💡 {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                                    message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-sm mt-0.5">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                )}
                                
                                <div
                                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-sm ${
                                        message.role === "user"
                                            ? "rounded-tr-sm bg-green-600 text-white"
                                            : "rounded-tl-sm bg-white border border-gray-100 text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                                    }`}
                                >
                                    {message.role === "user" ? (
                                        <div>
                                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                                {message.text}
                                            </p>
                                            {message.time && (
                                                <div className="mt-1 text-right text-[10px] text-green-100">
                                                    {message.time}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <AiResponseFormatter
                                            content={message.text}
                                            timestamp={message.time}
                                        />
                                    )}
                                </div>

                                {message.role === "user" && (
                                    <div className="ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-200 text-gray-700 shadow-sm mt-0.5">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex w-full justify-start animate-in fade-in duration-200">
                                <div className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-sm">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-5 py-4 shadow-sm">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                                        <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                                        <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {isHindi ? "विशेषज्ञ सलाह तैयार की जा रही है..." : "Formulating agronomic advice..."}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div className="border-t border-gray-100 bg-white p-4">
                        {error && (
                            <div className="mb-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                            <input
                                ref={inputRef}
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder={
                                    isHindi
                                        ? "अपना सवाल यहाँ लिखें (उदा. टमाटर के पत्तों पर पीले धब्बे क्यों हैं?)..."
                                        : "Ask your farming question (e.g. How to prevent wheat rust?)..."
                                }
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 pl-5 pr-14 py-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className="absolute right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md shadow-green-600/25 transition-all hover:bg-green-700 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                                title="Send question"
                            >
                                <SendHorizontal className="h-5 w-5" />
                            </button>
                        </form>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 px-2">
                            <span>Press Enter to send</span>
                            <span>Powered by Gemini 3.5 AI</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}