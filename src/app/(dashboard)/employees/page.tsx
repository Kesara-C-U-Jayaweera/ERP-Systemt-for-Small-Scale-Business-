import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const prisma = new PrismaClient()

export default async function EmployeesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return null

  const teamMembers = await prisma.user.findMany({
    where: { tenantId: dbUser.tenantId },
    orderBy: { createdAt: 'asc' }
  })

  const roleColors: Record<string, "default" | "secondary" | "destructive"> = {
    admin: "default",
    manager: "default",
    cashier: "secondary",
    accountant: "secondary",
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground mt-1">Manage your business users and their access roles.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {["admin", "manager", "cashier", "accountant"].map(role => {
          const count = teamMembers.filter(u => u.role === role).length
          return (
            <Card key={role} className="border shadow-sm">
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 capitalize">{role}s</div>
                <div className="text-3xl font-bold">{count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map(member => (
              <TableRow key={member.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="font-medium">
                  {member.firstName} {member.lastName}
                  {member.id === user.id && (
                    <span className="ml-2 text-xs text-primary font-semibold">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={roleColors[member.role] ?? "secondary"} className="capitalize">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={member.active ? "default" : "secondary"}>
                    {member.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(member.createdAt).toLocaleDateString("en-LK")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
