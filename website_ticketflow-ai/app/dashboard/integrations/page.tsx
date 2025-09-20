import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Globe,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  Code,
} from "lucide-react"

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Slack",
      description: "Team communication and notifications",
      icon: MessageSquare,
      connected: true,
      category: "Communication",
      color: "bg-blue-600",
    },
    {
      name: "Microsoft Teams",
      description: "Enterprise communication platform",
      icon: MessageSquare,
      connected: false,
      category: "Communication",
      color: "bg-purple-600",
    },
    {
      name: "Jira",
      description: "Project management and issue tracking",
      icon: FileText,
      connected: true,
      category: "Project Management",
      color: "bg-orange-600",
    },
    {
      name: "ServiceNow",
      description: "Enterprise service management",
      icon: Database,
      connected: false,
      category: "ITSM",
      color: "bg-green-600",
    },
    {
      name: "Salesforce",
      description: "Customer relationship management",
      icon: Globe,
      connected: true,
      category: "CRM",
      color: "bg-blue-500",
    },
    {
      name: "Zendesk",
      description: "Customer support platform",
      icon: MessageSquare,
      connected: false,
      category: "Support",
      color: "bg-yellow-600",
    },
    {
      name: "Office 365",
      description: "Microsoft productivity suite",
      icon: Mail,
      connected: true,
      category: "Productivity",
      color: "bg-red-600",
    },
    {
      name: "Google Workspace",
      description: "Google productivity tools",
      icon: Calendar,
      connected: false,
      category: "Productivity",
      color: "bg-blue-400",
    },
  ]

  const categories = ["All", "Communication", "Project Management", "ITSM", "CRM", "Support", "Productivity"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4 mr-2" />
            API Documentation
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Request Integration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button key={category} variant="outline" size="sm" className="h-8 bg-transparent">
                {category}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const Icon = integration.icon
              return (
                <Card key={integration.name} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      {integration.connected ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">{integration.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      {integration.connected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Connected
                          </Badge>
                          <Switch defaultChecked size="sm" />
                        </div>
                      ) : (
                        <Button size="sm" className="w-full">
                          Connect
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {integrations
              .filter((i) => i.connected)
              .map((integration) => {
                const Icon = integration.icon
                return (
                  <Card key={integration.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle>{integration.name}</CardTitle>
                            <CardDescription>{integration.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable notifications</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sync data</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Logs
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Integrations</CardTitle>
              <CardDescription>Build custom integrations using our REST API and webhooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input id="webhook-url" placeholder="https://your-app.com/webhooks/ticketflow" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your API key" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
                <Button variant="outline">
                  <Code className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Custom Webhook #1</CardTitle>
                <CardDescription>https://api.acme.com/ticketflow-webhook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Events:</span>
                    <span>ticket.created, ticket.updated</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last triggered:</span>
                    <span>2 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom API Integration</CardTitle>
                <CardDescription>Internal CRM synchronization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sync frequency:</span>
                    <span>Every 15 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last sync:</span>
                    <span>5 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
