"use client"


interface AnimatedBackgroundProps {
  theme?: string
  primaryColor?: string
}

export function AnimatedBackground({ theme, primaryColor = "#7C3AED" }: AnimatedBackgroundProps) {
  if (theme !== 'aurora') return null

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* Animated Gradient Orbs */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-40 blur-[120px] mix-blend-screen animate-blob"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[100px] mix-blend-screen animate-blob animation-delay-2000 bg-purple-600"
      />
      <div
        className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-30 blur-[100px] mix-blend-screen animate-blob animation-delay-4000 bg-blue-600"
      />

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
