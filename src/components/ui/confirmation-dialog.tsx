"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";

export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = false,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-[#17251f]/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e4eae2] bg-white p-6 shadow-[0_30px_90px_-30px_#1d3f2c] focus:outline-none">
          <AlertDialog.Title className="text-lg font-semibold tracking-[-.04em] text-[#24362c]">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-[#758279]">{description}</AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel className="h-10 rounded-lg border border-[#e2e8e0] px-3.5 text-xs font-bold text-[#5e6e63] transition hover:bg-[#f7f9f6]">Keep it</AlertDialog.Cancel>
            <AlertDialog.Action onClick={onConfirm} className={`h-10 rounded-lg px-3.5 text-xs font-extrabold text-white transition ${destructive ? "bg-[#ad5146] hover:bg-[#963e34]" : "bg-[#176b4d] hover:bg-[#10563d]"}`}>{confirmLabel}</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
