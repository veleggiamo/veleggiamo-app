import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { ArticleMeta } from '@/types/article'

export function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link href={`/articoli/${article.slug}`} className="group">
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <div className="relative h-40 bg-sky-100 shrink-0">
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">{article.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {article.readingTime && <span>⏱️ {article.readingTime} min</span>}
            <span>{article.updatedAt ?? article.publishedAt}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
