import Navbar from "./Navbar"

interface PageLayoutProps {
  children: React.ReactNode
  maxWidth?: string
}

/**
 * Wrapper de página padrão: dark mode, min-h-screen, gradientes decorativos e container centralizado.
 * Usado em todas as páginas internas (Setores, Funcionários, etc.).
 */
export function PageLayout({ children, maxWidth = "max-w-7xl" }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_5%,oklch(0.73_0.14_68_/_0.09)_0%,transparent_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_95%,oklch(0.62_0.12_50_/_0.07)_0%,transparent_100%)]" />

      <Navbar />

      <div className={`relative z-10 mx-auto ${maxWidth} overflow-x-hidden px-6 py-10`}>
        {children}
      </div>

    </div>
  )
}
