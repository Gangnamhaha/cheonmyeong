import Link from 'next/link'
import { SITE_URL } from '@/lib/constants'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || SITE_URL

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const listItem: { '@type': 'ListItem'; position: number; name: string; item?: string } = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
      }

      if (item.href) {
        listItem.item = `${SITE_ORIGIN}${item.href}`
      }

      return listItem
    }),
  }

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-5 text-xs text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <span key={`${item.label}-${index}`}>
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-amber-300">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-slate-300' : ''}>{item.label}</span>
              )}
              {!isLast ? ' > ' : null}
            </span>
          )
        })}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  )
}
