
"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, LoaderCircle, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { listUsers, ListUsersOutput } from "@/ai/flows/list-users"
import { inviteUser, InviteUserInput } from "@/ai/flows/invite-user"
import { deleteAllUsers, deleteUser } from "@/ai/flows/delete-all-users"
import { useAuth } from "@/hooks/use-auth"


const CleanupCard = ({ onCleanupDone }: { onCleanupDone: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isCleaning, setIsCleaning] = useState(false);

    const handleCleanup = async () => {
        if (!user || !user.email) {
            toast({ variant: "destructive", title: "Error", description: "Admin user not found." });
            return;
        }
        setIsCleaning(true);
        try {
            const result = await deleteAllUsers({ emailToKeep: user.email });
            if (result.success) {
                toast({ title: "Cleanup Successful", description: result.message });
                onCleanupDone();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Cleanup Failed", description: error.message });
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trash className="h-5 w-5"/> Database Cleanup</CardTitle>
                <CardDescription className="text-destructive/80">
                    This is a one-time action to remove all users except for your own admin account.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isCleaning}>
                            {isCleaning && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Delete All Other Users
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all user accounts and their associated data, except for your currently logged-in admin account ({user?.email}).
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCleanup}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<ListUsersOutput>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"Student" | "Admin" | "">("");
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await listUsers();
            setUsers(userList);
        } catch (error: any) {
            console.error("Failed to fetch users:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: `Could not fetch the user list. ${error.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !inviteRole) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide both an email and a role.",
            });
            return;
        }

        setIsInviting(true);
        try {
            const input: InviteUserInput = { email: inviteEmail, role: inviteRole as "Student" | "Admin" };
            const result = await inviteUser(input);
            if (result.success) {
                toast({
                    title: "Invitation Sent",
                    description: `${inviteEmail} has been invited as a ${inviteRole}.`,
                });
                setInviteEmail("");
                setInviteRole("");
                await fetchUsers(); // Refresh the user list
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Invitation Failed",
                description: error.message || "An unknown error occurred.",
            });
        } finally {
            setIsInviting(false);
        }
    }
    
    const handleDeleteUser = async (userToDelete: ListUsersOutput[0]) => {
        if (currentUser?.uid === userToDelete.uid) {
            toast({ variant: "destructive", title: "Action Not Allowed", description: "You cannot delete your own account." });
            return;
        }
        setIsDeleting(true);
        try {
            const result = await deleteUser({ uid: userToDelete.uid });
            if (result.success) {
                toast({ title: "User Deleted", description: `User ${userToDelete.name} has been deleted.` });
                await fetchUsers(); // Refresh list
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
      <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">User Management</h1>
            <p className="text-muted-foreground">Invite, create, and manage users for the platform.</p>
        </div>
  
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-8 md:col-span-1">
                <Card>
                    <form onSubmit={handleInvite}>
                        <CardHeader>
                            <CardTitle>Invite New User</CardTitle>
                            <CardDescription>Enter email and assign a role to send an invite.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                           <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="user@example.com" 
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    disabled={isInviting}
                                />
                           </div>
                           <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                 <Select 
                                    value={inviteRole}
                                    onValueChange={(value: "Student" | "Admin") => setInviteRole(value)}
                                    disabled={isInviting}
                                 >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                           <Button type="submit" disabled={isInviting || !inviteEmail || !inviteRole}>
                                {isInviting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isInviting ? "Sending..." : "Send Invitation"}
                           </Button>
                        </CardContent>
                    </form>
                </Card>
                <CleanupCard onCleanupDone={fetchUsers} />
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User List</CardTitle>
                        <CardDescription>A list of all users on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24">
                                                No users found. Invite a user to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map(user => (
                                        <TableRow key={user.uid}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback>{user.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid gap-1">
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                                                    Delete User
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the user <span className="font-bold">{user.name}</span>. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUser(user)}>Confirm</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
  }

    