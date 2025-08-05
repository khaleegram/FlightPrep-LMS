
"use client"

import { useEffect, useState } from "react"
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { app } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Crown, Medal, Trophy, LoaderCircle } from "lucide-react"

type LeaderboardUser = {
    id: string;
    rank: number;
    name: string;
    department: string;
    score: number;
    avatar: string;
    avatarUrl?: string;
}

const TopPlayerCard = ({ player, rank }: { player: LeaderboardUser, rank: number }) => {
    const rankColors = ["text-yellow-400", "text-gray-400", "text-orange-400"];
    const rankIcons = [
        <Crown key="1" className={`h-8 w-8 ${rankColors[0]}`} />,
        <Medal key="2" className={`h-8 w-8 ${rankColors[1]}`} />,
        <Trophy key="3" className={`h-8 w-8 ${rankColors[2]}`} />,
    ];
    return (
        <Card className="flex flex-col items-center justify-center p-6 text-center">
            {rankIcons[rank - 1]}
            <Avatar className="w-24 h-24 mt-4 border-4 border-primary">
                <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="pilot avatar" />
                <AvatarFallback className="text-3xl">{player.avatar}</AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-xl font-bold">{player.name}</h3>
            <p className="text-muted-foreground">{player.department}</p>
            <p className="mt-2 text-2xl font-black text-primary">{player.score.toLocaleString()} pts</p>
        </Card>
    );
};


export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    const usersQuery = query(collection(db, "users"), orderBy("leaderboardScore", "desc"), limit(50));
    
    const unsub = onSnapshot(usersQuery, (snapshot) => {
        const usersData: LeaderboardUser[] = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                id: doc.id,
                rank: index + 1,
                name: data.displayName || 'Unnamed User',
                department: data.department || 'N/A',
                score: data.leaderboardScore || 0,
                avatar: (data.displayName || 'U').split(' ').map((n: string) => n[0]).join(''),
            };
        });
        setLeaderboardData(usersData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching leaderboard data:", error);
        setIsLoading(false);
    });

    return () => unsub();
  }, [])


  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">Leaderboard</h1>
            <p className="text-muted-foreground">See who is at the top of the aviation game.</p>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : leaderboardData.length === 0 ? (
            <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                    The leaderboard is empty. Compete in exams to get your name on the board!
                </CardContent>
            </Card>
        ) : (
            <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {topThree.map((player, index) => (
                        <TopPlayerCard key={player.id} player={player} rank={index + 1} />
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Full Rankings</CardTitle>
                        <CardDescription>The complete list of student rankings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Rank</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {restOfLeaderboard.map((player) => (
                                <TableRow key={player.id}>
                                    <TableCell className="font-bold text-lg text-primary">{player.rank}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="pilot avatar" />
                                                <AvatarFallback>{player.avatar}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{player.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{player.department}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{player.score.toLocaleString()} pts</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </>
        )}
    </div>
  )
}
