"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useSound } from "@/hooks/use-sound"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono font-bold uppercase tracking-wider transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white border-3 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none",
        destructive:
          "bg-red-500 text-white border-3 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-red-lg active:translate-x-0 active:translate-y-0 active:shadow-none",
        outline:
          "bg-white text-black border-3 border-black shadow-brutal-sm hover:bg-black hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none",
        secondary:
          "bg-brutal-gray-light text-black border-3 border-black shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none",
        ghost: 
          "hover:bg-black hover:text-white border-3 border-transparent hover:border-black",
        link: 
          "text-black underline underline-offset-4 decoration-2 hover:text-red-500 hover:decoration-red-500",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  disableSound?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disableSound = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { play } = useSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableSound) {
        play("click");
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
