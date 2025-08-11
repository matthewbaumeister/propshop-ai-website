import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            AI for Property Management
          </Badge>
          
          <h1 className="mb-8 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Full-Stack AI Solutions
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              for Property Management
            </span>
          </h1>
          
          <p className="mb-10 text-xl text-gray-600 lg:text-2xl leading-relaxed">
            Outcomes delivered with world-class AI models, intelligent automation, 
            and enterprise-grade security for your property business.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Book a Demo →
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
              Build AI →
            </Button>
          </div>
        </div>

        {/* Feature highlights with Scale-inspired design */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="mb-6 h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Fine-Tuning & RLHF</h3>
              <p className="text-gray-600 leading-relaxed">
                Adapt best-in-class foundation models to your property data to build sustainable, 
                successful AI programs for your enterprise.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="mb-6 h-16 w-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-3xl">🏗️</span>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Foundation Models</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrate with leading AI models from open-source to closed-source, 
                including Google, Meta, Cohere, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="mb-6 h-16 w-16 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Enterprise Data</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrate your enterprise property data into AI models, providing 
                the base for long-term strategic differentiation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Partner logos section */}
        <div className="mt-20 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
            AI PROVIDERS WE PARTNER WITH:
          </p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">OpenAI</div>
            <div className="text-2xl font-bold text-gray-400">Anthropic</div>
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">Meta</div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-100/30 blur-3xl"></div>
      </div>
    </section>
  )
}
