import { AlertCircle, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"

interface ErrorDisplayProps {
  title?: string
  message: string
  retry?: () => void
  homeLink?: boolean
}

export function ErrorDisplay({ title = "Something went wrong", message, retry, homeLink = false }: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="size-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{message}</p>

      <div className="flex items-center gap-4">
        {retry && (
          <Button onClick={retry} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Try Again
          </Button>
        )}

        {homeLink && (
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}
