import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AICapabilities() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Apply AI
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Transform your property data and expertise into agentic solutions that 
            continuously improve with human interaction and AI automation.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Agentic Solutions */}
          <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Agentic Solutions
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enterprise AI Transformation</h3>
                    <p className="text-gray-600 text-sm">
                      Deeply personalize property management and automate knowledge work 
                      with intelligent AI agents.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Decision Advantage</h3>
                    <p className="text-gray-600 text-sm">
                      Orchestrate agent workflows for strategic property decisions 
                      and market analysis.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Learn More →
              </Button>
            </CardContent>
          </Card>

          {/* Generative AI */}
          <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Generative AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📝</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Content Generation</h3>
                    <p className="text-gray-600 text-sm">
                      Generate property listings, reports, and marketing materials 
                      with AI-powered content creation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Market Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      Analyze market trends, property valuations, and investment 
                      opportunities with AI insights.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full border-2">
                Explore Features →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional capabilities */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Engine</h3>
            <p className="text-sm text-gray-600">
              World-class data processing and AI model training
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-sm text-gray-600">
              Bank-level security with compliance and encryption
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">API Integration</h3>
            <p className="text-sm text-gray-600">
              Seamless integration with your existing systems
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">
              Advanced analytics and performance insights
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
