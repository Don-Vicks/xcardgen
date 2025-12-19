import { EventRegistrationView } from "@/components/public/event-registration-view"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { Metadata } from "next"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string) {
  try {
    const res = await eventsRequest.getPublic(slug)
    return res.data
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: "Event Not Found" }

  return {
    title: `${event.name} - Registration`,
    description: `Register for ${event.name} and get your personalized xCard.`,
    openGraph: {
      images: event.coverImage ? [event.coverImage] : [],
      title: event.name,
      description: `Register for ${event.name}`,
    }
  }
}

export default async function PublicEventPage({ params, searchParams }: PageProps & { searchParams: Promise<{ embed?: string }> }) {
  const { slug } = await params
  const { embed } = await searchParams
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  // Pre-fetch template if linked
  let template = null
  if (event.template) {
    // If includes was successful, event.template should be the object
    template = event.template
  }

  const isEmbed = embed === 'true'

  return (
    <main className={`min-h-dvh flex flex-col bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary relative isolate overflow-x-hidden${isEmbed ? ' overflow-hidden' : ''}`}>
      <EventRegistrationView event={event} template={template} isEmbed={isEmbed} />
    </main>
  )
}
