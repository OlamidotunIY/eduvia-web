import { useLocation } from 'react-router-dom'

export function PlaceholderPage() {
  const location = useLocation()
  return <section><h1 className="font-heading text-3xl font-semibold">{location.pathname.slice(1).replace(/-/g, ' ') || 'Page'}</h1><p className="mt-3 text-muted-foreground">This workspace area is ready for its Eduvia feature implementation.</p></section>
}
