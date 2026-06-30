import { useEffect } from 'react'

interface SEOMetaConfig {
  title: string
  description: string
  path?: string
  image?: string
  type?: 'website' | 'article'
}

const BASE_URL = 'https://cosmere-archive.vercel.app'
const DEFAULT_IMAGE = '/icon-512.png'

function setOrUpdateMeta(selector: string, attrs: Record<string, string>) {
  let el = document.querySelector(selector) as HTMLElement | null
  if (!el) {
    el = document.createElement('meta')
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v)
    }
    document.head.appendChild(el)
  } else {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v)
    }
  }
}

export function useSEOMeta(config: SEOMetaConfig) {
  const { title, description, path = '', image = DEFAULT_IMAGE, type = 'website' } = config
  const url = BASE_URL + path

  useEffect(() => {
    document.title = title
    setOrUpdateMeta('meta[name="description"]', { name: 'description', content: description })
    setOrUpdateMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    setOrUpdateMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setOrUpdateMeta('meta[property="og:image"]', { property: 'og:image', content: BASE_URL + image })
    setOrUpdateMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    setOrUpdateMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setOrUpdateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setOrUpdateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    setOrUpdateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setOrUpdateMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: BASE_URL + image })

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, url, image, type])
}
