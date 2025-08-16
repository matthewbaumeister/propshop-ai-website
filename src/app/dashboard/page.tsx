import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prop Shop AI Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s your proposal generation overview and AI insights.</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Create New Proposal
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Proposals</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +3 this week
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-3xl font-bold text-gray-900">78%</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +5% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contract Value</p>
                  <p className="text-3xl font-bold text-gray-900">$2.4M</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +18% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                  <p className="text-3xl font-bold text-gray-900">96%</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +2% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "DOD Cybersecurity Contract", agency: "Department of Defense", status: "Under Review", value: "$450K" },
                  { name: "GSA IT Services", agency: "General Services Administration", status: "Submitted", value: "$320K" },
                  { name: "VA Medical Equipment", agency: "Veterans Affairs", status: "Won", value: "$180K" },
                ].map((proposal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <h3 className="font-semibold text-gray-900">{proposal.name}</h3>
                      <p className="text-sm text-gray-600">{proposal.agency}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={proposal.status === "Won" ? "secondary" : proposal.status === "Under Review" ? "default" : "outline"} className="mb-1">
                        {proposal.status}
                      </Badge>
                      <p className="text-sm font-medium text-gray-900">{proposal.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-900 mb-1">Market Opportunity</h3>
                  <p className="text-sm text-blue-700">
                    Cybersecurity contracts in your region expected to increase 25% in next quarter.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-900 mb-1">Proposal Optimization</h3>
                  <p className="text-sm text-green-700">
                    AI suggests adding 3 compliance keywords could improve your win rate by 12%.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-orange-500">
                  <h3 className="font-semibold text-orange-900 mb-1">Deadline Alert</h3>
                  <p className="text-sm text-orange-700">
                    DOD contract submission deadline in 5 days - compliance review recommended.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">📝</span>
                <span>New Proposal</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">🔍</span>
                <span>Search Contracts</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">📊</span>
                <span>Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">⚙️</span>
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
