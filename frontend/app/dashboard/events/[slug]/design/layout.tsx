export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* We might want a specific header for editor or reuse dashboard one but minimized */}
      <main className="flex flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
