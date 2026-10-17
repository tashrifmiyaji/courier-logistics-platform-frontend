"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import {
	Bot,
	ChevronDown,
	CornerDownLeft,
	LifeBuoy,
	Send,
	Sparkles,
	X,
} from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { findAssistantTopic } from "@/features/support/assistant";

const starters = [
	{ label: "Book a parcel", question: "How do I book a parcel?" },
	{ label: "Track a shipment", question: "How can I track my shipment?" },
	{ label: "Payment help", question: "When is my bKash payment confirmed?" },
];

const initialMessages: UIMessage[] = [
	{
		id: "welcome",
		role: "assistant",
		parts: [
			{
				type: "text",
				text: "Hello! I can help you book, track, or manage a GOparcel delivery. What would you like to do?",
			},
		],
	},
];

function messageText(message: UIMessage) {
	return message.parts
		.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join("");
}

export function SupportAssistant() {
	const [open, setOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [transport] = useState(
		() => new DefaultChatTransport({ api: "/api/support-chat" }),
	);
	const { messages, sendMessage, status, error, clearError } =
		useChat<UIMessage>({
			messages: initialMessages,
			transport,
			onError: (chatError) => {
				console.error("GOparcel support assistant request failed:", chatError);
			},
		});
	const scrollRef = useRef<HTMLDivElement>(null);
	const isLoading = status === "submitted" || status === "streaming";
	const lastMessage = messages.at(-1);
	const lastMessageText = lastMessage ? messageText(lastMessage) : "";

	useEffect(() => {
		if (open && lastMessageText)
			scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [lastMessageText, open]);

	useEffect(() => {
		const showAssistant = () => setOpen(true);
		window.addEventListener("GOparcel:open-assistant", showAssistant);
		return () =>
			window.removeEventListener("GOparcel:open-assistant", showAssistant);
	}, []);

	function ask(rawQuestion: string) {
		const cleanQuestion = rawQuestion.trim();
		if (!cleanQuestion || isLoading) return;
		setQuestion("");
		if (error) clearError();
		void sendMessage({ text: cleanQuestion });
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		ask(question);
	}

	return (
		<div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
			{open ? (
				<section
					aria-label="GOparcel help assistant"
					className="flex h-[min(440px,calc(100dvh-240px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-[24px] border border-[#dce8de] bg-white shadow-[0_30px_90px_-35px_rgb(16_45_29_/_55%)]"
				>
					<header className="flex items-center justify-between bg-[#173c2e] px-4 py-3.5 text-white">
						<div className="flex items-center gap-3">
							<span className="grid size-10 place-items-center rounded-2xl bg-white/10 text-[#c8ead3]">
								<Bot size={20} />
							</span>
							<div>
								<p className="text-sm font-extrabold">GOparcel AI assistant</p>
								<p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#c5d8ca]">
									<span className="size-1.5 rounded-full bg-[#8bd7a1]" />
									AI-powered delivery help
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label="Close help assistant"
							className="grid size-9 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
						>
							<X size={17} />
						</button>
					</header>

					<div
						ref={scrollRef}
						aria-live="polite"
						className="flex-1 space-y-3 overflow-y-auto bg-[#f7f9f6] p-4"
					>
						<div className="mb-2 rounded-xl border border-[#dfe9e0] bg-white px-3 py-2.5 text-[10px] leading-5 text-[#627369]">
							<Sparkles size={13} className="mr-1 inline text-[#48815a]" />
							Ask in your own words. AI generates each reply using GOparcel's
							help guide; it cannot see private shipment or account data.
						</div>
						{messages.map((message, index) => {
							const previousUserMessage =
								message.role === "assistant"
									? [...messages.slice(0, index)]
											.reverse()
											.find((previous) => previous.role === "user")
									: undefined;
							const topic = previousUserMessage
								? findAssistantTopic(messageText(previousUserMessage))
								: undefined;
							return (
								<div
									key={message.id}
									className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-xs leading-5 ${message.role === "user" ? "rounded-br-md bg-[#176b4d] text-white" : "rounded-bl-md border border-[#e5ebe4] bg-white text-[#394a3f]"}`}
									>
										<p>{messageText(message)}</p>
										{topic ? (
											<Link
												href={topic.href}
												onClick={() => setOpen(false)}
												className="mt-2 inline-flex items-center gap-1 font-extrabold text-[#28734d] underline decoration-[#c4ddca] underline-offset-2"
											>
												{topic.linkLabel}
												<CornerDownLeft size={12} />
											</Link>
										) : null}
									</div>
								</div>
							);
						})}
						{error ? (
							<div
								role="alert"
								className="rounded-xl border border-[#f0d3cc] bg-white p-3 text-xs leading-5 text-[#854333]"
							>
								<p>
									{error.message ||
										"The AI assistant could not generate a response."}
								</p>
								<Link
									href="/help"
									onClick={() => setOpen(false)}
									className="mt-2 inline-flex font-extrabold underline"
								>
									Open help center
								</Link>
							</div>
						) : null}
						{messages.length === 1 ? (
							<div className="grid gap-2 pt-1">
								{starters.map((starter) => (
									<button
										key={starter.label}
										type="button"
										disabled={isLoading}
										onClick={() => ask(starter.question)}
										className="rounded-xl border border-[#dfe8df] bg-white px-3 py-2.5 text-left text-[11px] font-bold text-[#46604e] transition hover:border-[#abcbb3] hover:bg-[#f2f7f2] disabled:opacity-50"
									>
										{starter.label}
										<span className="float-right text-[#87a48f]">↗</span>
									</button>
								))}
							</div>
						) : null}
					</div>

					<form
						onSubmit={handleSubmit}
						className="flex items-center gap-2 border-t border-[#e7ece6] bg-white p-3"
					>
						<label className="sr-only" htmlFor="support-question">
							Ask about booking, tracking, payment, or your account
						</label>
						<input
							id="support-question"
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
							maxLength={300}
							disabled={isLoading}
							placeholder="Ask about a delivery…"
							className="h-11 min-w-0 flex-1 rounded-xl border border-[#e1e8df] bg-[#f8faf7] px-3 text-xs text-[#34463a] outline-none placeholder:text-[#929f95] focus:border-[#83ae90] disabled:opacity-60"
						/>
						<button
							type="submit"
							disabled={!question.trim() || isLoading}
							aria-label="Send question"
							className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#176b4d] text-white transition hover:bg-[#10563d] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{isLoading ? (
								<span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
							) : (
								<Send size={16} />
							)}
						</button>
					</form>
					<footer className="flex items-center justify-center gap-1.5 bg-white pb-2.5 text-[9px] text-[#8b978e]">
						<LifeBuoy size={11} />
						AI answers may be imperfect; account details aren't accessed
					</footer>
				</section>
			) : null}
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-label={
					open ? "Close help assistant" : "Open GOparcel help assistant"
				}
				aria-expanded={open}
				className="group flex h-14 items-center gap-2.5 rounded-full bg-[#176b4d] px-4 text-white shadow-[0_12px_35px_-12px_#176b4d] transition hover:-translate-y-0.5 hover:bg-[#10563d]"
			>
				<span className="grid size-9 place-items-center rounded-full bg-white/15">
					{open ? <ChevronDown size={19} /> : <Bot size={20} />}
				</span>
				<span className="pr-1 text-xs font-extrabold">
					{open ? "Close help" : "Ask GOparcel"}
				</span>
			</button>
		</div>
	);
}
