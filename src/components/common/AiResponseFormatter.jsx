import React, { useState } from "react";
import { Copy, Check, AlertTriangle, Lightbulb, CheckCircle2, ChevronRight } from "lucide-react";

// Formats inline text with bolding (**text**) and code (`text`)
function formatInlineText(text) {
    if (!text) return "";
    
    // Split by markdown bold (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index} className="font-bold text-gray-950 text-[14.5px]">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={index} className="rounded bg-green-100/60 px-1.5 py-0.5 font-mono text-xs text-green-800">
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

export default function AiResponseFormatter({ content, timestamp }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!content) return null;

    // Process lines into structured blocks
    const lines = content.split("\n");
    const blocks = [];
    let currentList = null;

    lines.forEach((rawLine, idx) => {
        const line = rawLine.trim();

        if (!line) {
            if (currentList) {
                blocks.push(currentList);
                currentList = null;
            }
            return;
        }

        // Heading: ### Heading or ## Heading or # Heading
        if (line.startsWith("#")) {
            if (currentList) {
                blocks.push(currentList);
                currentList = null;
            }
            const cleanHeading = line.replace(/^#+\s*/, "");
            blocks.push({ type: "heading", text: cleanHeading, key: `h-${idx}` });
            return;
        }

        // Warning block detection
        if (/^(warning|caution|सावधानी|चेतावनी|ध्यान दें)/i.test(line)) {
            if (currentList) {
                blocks.push(currentList);
                currentList = null;
            }
            blocks.push({ type: "warning", text: line, key: `w-${idx}` });
            return;
        }

        // Numbered list item: 1. or 2.
        const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
            if (!currentList || currentList.type !== "numbered") {
                if (currentList) blocks.push(currentList);
                currentList = { type: "numbered", items: [], key: `nl-${idx}` };
            }
            currentList.items.push({ num: numberedMatch[1], text: numberedMatch[2] });
            return;
        }

        // Bulleted list item: * or -
        if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
            const cleanItem = line.replace(/^[\*\-•]\s*/, "");
            if (!currentList || currentList.type !== "bullet") {
                if (currentList) blocks.push(currentList);
                currentList = { type: "bullet", items: [], key: `bl-${idx}` };
            }
            currentList.items.push(cleanItem);
            return;
        }

        // Regular paragraph or bold headline paragraph
        if (currentList) {
            blocks.push(currentList);
            currentList = null;
        }

        // Check if paragraph is a key-value style header: **Header:** Content
        blocks.push({ type: "paragraph", text: line, key: `p-${idx}` });
    });

    if (currentList) {
        blocks.push(currentList);
    }

    return (
        <div className="relative group">
            {/* Top Bar / Copy button */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100/80">
                <span className="text-[11px] font-semibold text-green-700 tracking-wide uppercase flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-green-600" /> AgriN AI Advisor
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-green-700 bg-white/70 hover:bg-green-50 px-2 py-0.5 rounded-md border border-gray-200/60 transition"
                    title="Copy recommendation"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600 font-semibold">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Structured Content Rendering */}
            <div className="space-y-3.5 text-gray-800 text-[14px] leading-relaxed">
                {blocks.map((block) => {
                    if (block.type === "heading") {
                        return (
                            <div key={block.key} className="pt-2">
                                <h4 className="text-[15px] font-bold text-gray-900 border-l-4 border-green-600 pl-2.5">
                                    {formatInlineText(block.text)}
                                </h4>
                            </div>
                        );
                    }

                    if (block.type === "warning") {
                        return (
                            <div key={block.key} className="rounded-xl bg-amber-50/90 border border-amber-200/80 p-3 flex items-start gap-2.5 text-amber-900">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs sm:text-sm font-medium">
                                    {formatInlineText(block.text)}
                                </div>
                            </div>
                        );
                    }

                    if (block.type === "numbered") {
                        return (
                            <div key={block.key} className="space-y-2.5 my-2">
                                {block.items.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 rounded-xl bg-green-50/40 border border-green-100/60 p-2.5 transition hover:bg-green-50/70">
                                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-[11px] font-extrabold text-white">
                                            {item.num}
                                        </span>
                                        <div className="text-sm text-gray-800 flex-1 leading-snug">
                                            {formatInlineText(item.text)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    if (block.type === "bullet") {
                        return (
                            <ul key={block.key} className="space-y-2 my-2">
                                {block.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-800">
                                        <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="flex-1 leading-snug">
                                            {formatInlineText(item)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        );
                    }

                    // Regular Paragraph
                    return (
                        <p key={block.key} className="leading-relaxed">
                            {formatInlineText(block.text)}
                        </p>
                    );
                })}
            </div>

            {timestamp && (
                <div className="mt-2 text-right text-[10px] text-gray-400">
                    {timestamp}
                </div>
            )}
        </div>
    );
}
