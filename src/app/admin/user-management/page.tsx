import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
  export default function UserManagementPage() {
    return (
      <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">User Management</h1>
            <p className="text-muted-foreground">Invite, create, and manage users for the platform.</p>
        </div>
  
        <Card>
            <CardHeader>
                <CardTitle>Invite New Admin</CardTitle>
                <CardDescription>This feature is coming soon.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>The ability to invite and manage administrators and students will be available here.</p>
            </CardContent>
        </Card>
      </div>
    )
  }
  