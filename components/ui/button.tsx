import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-md hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] focus-visible:ring-primary/50",

                destructive:
                    "bg-destructive text-destructive-foreground shadow-md hover:shadow-xl hover:shadow-destructive/20 hover:scale-[1.02] focus-visible:ring-destructive/50",

                outline:
                    "border-2 border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:shadow-lg focus-visible:ring-accent",

                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:shadow-lg hover:bg-secondary/80 hover:scale-[1.02] focus-visible:ring-secondary/50",

                ghost:
                    "hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-accent/50",

                link:
                    "text-primary underline-offset-4 hover:underline hover:text-primary/80",

                premium:
                    "bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-lg hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-indigo-400 bg-size-200 hover:bg-right-bottom",

                success:
                    "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-emerald-400",

                danger:
                    "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-2xl hover:shadow-rose-500/40 hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-rose-400",

                ocean:
                    "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-cyan-400",

                sunset:
                    "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white shadow-lg hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-orange-400",

                eco:
                    "bg-gradient-to-r from-lime-500 to-green-600 text-white shadow-lg hover:shadow-2xl hover:shadow-lime-500/40 hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-lime-400",

                glass:
                    "bg-white/10 backdrop-blur-xl border border-white/20 text-foreground shadow-xl hover:bg-white/20 hover:shadow-2xl hover:border-white/30 hover:scale-[1.02] focus-visible:ring-white/50",

                glow:
                    "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.6)] hover:shadow-[0_0_40px_rgba(192,38,211,0.8)] hover:scale-[1.05] hover:-translate-y-0.5 focus-visible:ring-fuchsia-400 animate-pulse-glow",
            },
            size: {
                default: "h-11 px-5 py-2.5 text-sm",
                sm: "h-9 rounded-lg px-3.5 text-xs",
                lg: "h-14 rounded-2xl px-10 text-base",
                xl: "h-16 rounded-2xl px-12 text-lg",
                icon: "h-11 w-11",
                "icon-sm": "h-9 w-9 rounded-lg",
                "icon-lg": "h-14 w-14 rounded-2xl",
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
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    children
                )}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
