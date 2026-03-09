import Link from 'next/link'

type RelatedLink = {
  href: string
  title: string
  description: string
}

type RelatedContentProps = {
  links: RelatedLink[]
}

export default function RelatedContent({ links }: RelatedContentProps) {
  const visibleLinks = links.slice(0, 6)

  if (visibleLinks.length < 3) {
    return null
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="font-serif-kr text-2xl font-bold text-amber-300">관련 콘텐츠</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {visibleLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-amber-400/70 hover:bg-amber-500/5"
          >
            <p className="text-sm font-semibold text-slate-100 transition group-hover:text-amber-200">{link.title}</p>
            <p className="mt-2 truncate text-xs text-slate-400">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
