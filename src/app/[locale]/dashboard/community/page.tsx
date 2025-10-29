import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/header"
import { PlusCircle, MessageCircle, ThumbsUp } from "lucide-react"
import { getTranslations } from "next-intl/server"

const forumPosts = [
  {
    id: 1,
    author: "Ramesh Kumar",
    avatar: "https://picsum.photos/id/1011/100/100",
    dataAiHint: "man farmer",
    title: "Best practices for drip irrigation in sugarcane?",
    excerpt: "I'm looking to install a drip irrigation system for my sugarcane field in Uttar Pradesh. What are the best practices for water management and scheduling? Any recommended brands for the equipment?",
    likes: 15,
    comments: 4,
  },
  {
    id: 2,
    author: "Sunita Devi",
    avatar: "https://picsum.photos/id/1027/100/100",
    dataAiHint: "woman farmer",
    title: "Organic pesticide recommendations for cotton crops.",
    excerpt: "Seeing some issues with bollworm in my cotton crop. I want to avoid chemical pesticides. Does anyone have effective organic or neem-based solutions that have worked well for them?",
    likes: 22,
    comments: 8,
  },
  {
    id: 3,
    author: "Vijay Singh",
    avatar: "https://picsum.photos/id/1005/100/100",
    dataAiHint: "farmer portrait",
    title: "Market price for Soybean in Indore Mandi is rising.",
    excerpt: "Just got back from the Indore Mandi. Soybean prices are up by almost ₹200/quintal today. Seems like a good time to sell if you have stock ready. The demand is high.",
    likes: 45,
    comments: 12,
  },
    {
    id: 4,
    author: "Anjali Patel",
    avatar: "https://picsum.photos/id/64/100/100",
    dataAiHint: "woman portrait",
    title: "New government subsidy for solar water pumps.",
    excerpt: "Heard on the news about a new subsidy scheme for solar pumps under PM-KUSUM. Has anyone applied for it? What's the process and how much is the subsidy?",
    likes: 31,
    comments: 6,
  },
]

export default async function CommunityPage() {
  const t = await getTranslations("CommunityPage");
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={t('title')}
        description={t('description')}
      />
      <main className="flex-1 p-4 md:p-6">
        <div className="flex justify-end mb-6">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('newDiscussion')}
          </Button>
        </div>
        <div className="space-y-6">
          {forumPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Image
                    src={post.avatar}
                    alt={post.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                    data-ai-hint={post.dataAiHint}
                  />
                  <div className="flex-1">
                    <CardTitle className="font-headline text-lg">{post.title}</CardTitle>
                    <CardDescription>
                      {t('postedBy')} <span className="font-semibold text-primary">{post.author}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes} {t('likes')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments} {t('comments')}</span>
                </div>
                <Button variant="link" className="ml-auto">{t('readMore')}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
