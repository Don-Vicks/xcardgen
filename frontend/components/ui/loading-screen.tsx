import { Layers, Loader2 } from "lucide-react"

export function LoadingScreen({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex w-full h-full min-h-[50vh] flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="relative mb-4">
        {/* Logo/Icon layer */}
        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 relative z-10">
          <Layers className="h-8 w-8 text-primary animate-pulse" />
        </div>
        {/* Spinner ring behind or around - optional decorative */}
        <div className="absolute inset-0 -m-2 border-t-2 border-r-2 border-primary/20 rounded-2xl animate-spin duration-3000" />
      </div>

      <h3 className="text-lg font-semibold tracking-tight">{text}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
        Please wait while we prepare your experience.
      </p>
    </div>
  )
}

export function LoadingSpinner() {
  return <Loader2 className="h-6 w-6 animate-spin text-primary" />
}
