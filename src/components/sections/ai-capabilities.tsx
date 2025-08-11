import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AICapabilities() {
  return (
    <section className="py-24 challenger-navy">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6 challenger-heading">
            The compliance engine for challengers.
          </h2>
          <p className="text-xl challenger-ink leading-relaxed challenger-body">
            Tools that showcase innovation over incumbency. Bring your capture, BD, and SMEs into one workspace.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Proposal Intelligence */}
          <Card className="border-0 glass-challenger shadow-lg hover:shadow-xl transition-all duration-300 glow-blue hover:glow-lime">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white challenger-heading">
                  Proposal Intelligence
                </CardTitle>
                <Badge variant="secondary" className="bg-[#2D5BFF]/20 text-[#2D5BFF] border-[#2D5BFF]/30 challenger-mono">
                  Core
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-[#2D5BFF]/20 flex items-center justify-center flex-shrink-0 glow-blue">
                    <span className="text-lg font-bold text-white challenger-mono">PI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white challenger-heading">Live Contract Feed</h3>
                    <p className="challenger-ink text-sm challenger-body">
                      Real-time government opportunity alerts with advanced search filters and competitive analysis.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-[#9AF23A]/20 flex items-center justify-center flex-shrink-0 glow-lime">
                    <span className="text-lg font-bold text-white challenger-mono">AI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white challenger-heading">Smart Matching</h3>
                    <p className="challenger-ink text-sm challenger-body">
                      AI-powered opportunity matching based on your capabilities, past performance, and win themes.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full animated-challenger glow-lime hover:scale-105 transition-transform challenger-heading">
                Explore Intelligence →
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Templates */}
          <Card className="border-0 glass-challenger shadow-lg hover:shadow-xl transition-all duration-300 glow-blue hover:glow-lime">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-white challenger-heading">
                Compliance Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-[#FFB020]/20 flex items-center justify-center flex-shrink-0 glow-orange">
                    <span className="text-lg font-bold text-white challenger-mono">CT</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white challenger-heading">Auto-Fill Structures</h3>
                    <p className="challenger-ink text-sm challenger-body">
                      Pre-built templates with compliance baked in that pass first review and reduce submission time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-[#F04438]/20 flex items-center justify-center flex-shrink-0 challenger-red">
                    <span className="text-lg font-bold text-white challenger-mono">QC</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white challenger-heading">Quality Control</h3>
                    <p className="challenger-ink text-sm challenger-body">
                      Automated validation for FAR, DFARS, and agency-specific requirements with real-time guidance.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full border-2 border-[#2D5BFF] text-[#2D5BFF] hover:bg-[#2D5BFF]/10 glass-challenger challenger-heading">
                View Templates →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional capabilities */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl animated-challenger flex items-center justify-center mx-auto mb-4 glow-blue">
              <span className="text-2xl font-bold text-white challenger-mono">DA</span>
            </div>
            <h3 className="font-semibold text-white mb-2 challenger-heading">Diversity Advantage</h3>
            <p className="text-sm challenger-ink challenger-body">
              Tools that showcase innovation over incumbency and highlight your unique value proposition
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl animated-challenger flex items-center justify-center mx-auto mb-4 glow-lime">
              <span className="text-2xl font-bold text-white challenger-mono">CT</span>
            </div>
            <h3 className="font-semibold text-white mb-2 challenger-heading">Collaboration Tools</h3>
            <p className="text-sm challenger-ink challenger-body">
              Bring your capture, BD, and SMEs into one workspace with real-time editing and version control
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl animated-challenger flex items-center justify-center mx-auto mb-4 glow-orange">
              <span className="text-2xl font-bold text-white challenger-mono">WP</span>
            </div>
            <h3 className="font-semibold text-white mb-2 challenger-heading">Win Probability</h3>
            <p className="text-sm challenger-ink challenger-body">
              Predictive analytics for proposal success and competitive positioning against prime contractors
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-xl animated-challenger flex items-center justify-center mx-auto mb-4 challenger-red">
              <span className="text-2xl font-bold text-white challenger-mono">PP</span>
            </div>
            <h3 className="font-semibold text-white mb-2 challenger-heading">Past Performance</h3>
            <p className="text-sm challenger-ink challenger-body">
              Automated past performance documentation and tracking for CPARS and contractor evaluations
            </p>
          </div>
        </div>

        {/* Guarantee Statement */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto glass-challenger p-8 rounded-xl glow-blue">
            <h3 className="text-2xl font-bold text-white mb-4 challenger-heading">
              The prime advantage — without the prime.
            </h3>
            <p className="text-lg challenger-ink challenger-body mb-6">
              If you don&apos;t submit a compliant proposal in your first 60 days, we&apos;ll extend your subscription free until you do.
            </p>
            <Button size="lg" className="animated-challenger glow-lime hover:scale-105 transition-transform challenger-heading">
              Start Your 60-Day Challenge →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
