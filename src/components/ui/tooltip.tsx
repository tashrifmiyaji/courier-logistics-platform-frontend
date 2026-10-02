"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export function Tooltip({
  children,
  content,
}: {
  children: ReactNode;
  content: string;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={350}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={7}
            className="z-50 rounded-lg bg-[#203b2c] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#203b2c]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
