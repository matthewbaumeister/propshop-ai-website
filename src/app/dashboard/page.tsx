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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your properties.</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Add Property
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +12% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-gray-900">94%</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +3% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">$127K</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +8% from last month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">7</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  3 pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Sunset Apartments", address: "123 Main St, Downtown", status: "Active", revenue: "$8,500" },
                  { name: "Riverside Condos", address: "456 Oak Ave, Midtown", status: "Active", revenue: "$12,200" },
                  { name: "Harbor View", address: "789 Pine Rd, Uptown", status: "Maintenance", revenue: "$6,800" },
                ].map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-600">{property.address}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={property.status === "Active" ? "secondary" : "destructive"} className="mb-1">
                        {property.status}
                      </Badge>
                      <p className="text-sm font-medium text-gray-900">{property.revenue}</p>
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
                    Property values in Downtown area expected to increase 15% in next 6 months.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-900 mb-1">Optimization Alert</h3>
                  <p className="text-sm text-green-700">
                    Raising rent by 5% on 3 properties could increase monthly revenue by $2,100.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-orange-500">
                  <h3 className="font-semibold text-orange-900 mb-1">Maintenance Prediction</h3>
                  <p className="text-sm text-orange-700">
                    HVAC system at Harbor View likely needs replacement within 3 months.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
