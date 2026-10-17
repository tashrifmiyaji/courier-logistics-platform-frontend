"use client";

export function AssistantLaunchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("GOparcel:open-assistant"))}
      className="h-10 shrink-0 rounded-xl bg-[#176b4d] px-4 text-xs font-extrabold text-white"
    >
      Open the assistant
    </button>
  );
}
