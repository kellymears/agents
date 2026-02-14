import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl sm:text-5xl font-sans font-bold mt-8 mb-6 text-foreground tracking-tight text-balance">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-sans font-semibold mt-12 mb-4 text-foreground tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-sans font-medium mt-8 mb-3 text-foreground">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="my-4 text-muted-foreground leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground">
        {children}
      </em>
    ),

    ul: ({ children }) => (
      <ul className="my-4 ml-6 space-y-2 text-muted-foreground list-disc marker:text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 space-y-2 text-muted-foreground list-decimal marker:text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed pl-1">
        {children}
      </li>
    ),

    code: ({ children, className }) => {
      const isCodeBlock = className?.startsWith('language-')
      if (isCodeBlock) {
        return <code className={className}>{children}</code>
      }
      return (
        <code className="inline-code">
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <div className="code-block my-6">
        <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
          {children}
        </pre>
      </div>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        className="text-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/50 hover:decoration-foreground/60"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),

    blockquote: ({ children }) => (
      <blockquote className="flat-card my-6 pl-4 pr-6 py-4 border-l-2 border-border">
        <div className="text-muted-foreground italic">
          {children}
        </div>
      </blockquote>
    ),

    hr: () => (
      <hr className="my-12 border-0 h-px bg-border" />
    ),

    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-border">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-medium text-foreground bg-muted">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-muted-foreground">
        {children}
      </td>
    ),

    ...components,
  }
}
