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
import { Crown, Medal, Trophy } from "lucide-react"

const leaderboardData = [
    { rank: 1, name: "Amelia Earhart", department: "Flying School", score: 5400, avatar: "AE", avatarUrl: "https://placehold.co/40x40.png" },
    { rank: 2, name: "Charles Lindbergh", department: "Flying School", score: 5150, avatar: "CL", avatarUrl: "https://placehold.co/40x40.png" },
    { rank: 3, name: "Bessie Coleman", department: "Flying School", score: 4900, avatar: "BC", avatarUrl: "https://placehold.co/40x40.png" },
    { rank: 4, name: "Wright Brothers", department: "Aircraft Maintenance Engineering", score: 4750, avatar: "WB" },
    { rank: 5, name: "Chuck Yeager", department: "Air Traffic Control", score: 4600, avatar: "CY" },
    { rank: 6, name: "Sully Sullenberger", department: "Cabin Crew", score: 4400, avatar: "SS" },
    { rank: 7, name: "John Glenn", department: "Prospective Student", score: 4200, avatar: "JG" },
    { rank: 8, name: "Alan Shepard", department: "Flying School", score: 4100, avatar: "AS" },
    { rank: 9, name: "Neil Armstrong", department: "Flying School", score: 4050, avatar: "NA" },
    { rank: 10, name: "Buzz Aldrin", department: "Flying School", score: 3900, avatar: "BA" },
];

const TopPlayerCard = ({ player, rank }: { player: typeof leaderboardData[0], rank: number }) => {
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
  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">Leaderboard</h1>
            <p className="text-muted-foreground">See who is at the top of the aviation game.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {topThree.map((player, index) => (
                <TopPlayerCard key={player.rank} player={player} rank={index + 1} />
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
                        <TableRow key={player.rank}>
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
    </div>
  )
}
