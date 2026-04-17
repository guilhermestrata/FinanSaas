import type { PropsWithChildren, ReactNode } from 'react'
import './card.css'

type Props = PropsWithChildren<{
  title: string
  subtitle?: string
  right?: ReactNode
}>

export function Card({ title, subtitle, right, children }: Props) {
  return (
    <section className="card">
      <header className="card__header">
        <div>
          <div className="card__title">{title}</div>
          {subtitle && <div className="card__subtitle">{subtitle}</div>}
        </div>
        {right && <div className="card__right">{right}</div>}
      </header>
      <div className="card__body">{children}</div>
    </section>
  )
}
