import type { ReactNode } from 'react'

export function AuthFormHeader({ title, description, children }: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <header className="mb-8 space-y-2">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      {children}
    </header>
  )
}
