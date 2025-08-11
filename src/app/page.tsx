import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { AICapabilities } from "@/components/sections/ai-capabilities"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <AICapabilities />
    </div>
  )
}
