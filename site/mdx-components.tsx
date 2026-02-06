import type { MDXComponents } from 'mdx/types'

// Custom components for MDX content
// Dark mode with liquid glass aesthetics

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings with gradient accents
    h1: ({ children }) => (
      <h1 className="text-4xl sm:text-5xl font-display font-bold mt-8 mb-6 text-obsidian-50 tracking-tight text-balance">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-display font-semibold mt-12 mb-4 text-obsidian-100 tracking-tight flex items-center gap-3">
        <span className="w-1 h-6 rounded-full bg-gradient-to-b from-glass-400 to-glass-600" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-display font-medium mt-8 mb-3 text-obsidian-200">
        {children}
      </h3>
    ),

    // Paragraphs and text
    p: ({ children }) => (
      <p className="my-4 text-obsidian-300 leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-obsidian-100">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-obsidian-200">
        {children}
      </em>
    ),

    // Lists - using native list styling
    ul: ({ children }) => (
      <ul className="my-4 ml-6 space-y-2 text-obsidian-300 list-disc marker:text-glass-500">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 space-y-2 text-obsidian-300 list-decimal marker:text-glass-400">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed pl-1">
        {children}
      </li>
    ),

    // Code blocks with glass effect
    code: ({ children, className }) => {
      // If className exists, it's a code block (has language like "language-bash")
      // If no className, it's inline code
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
        <pre className="p-4 overflow-x-auto text-sm font-mono text-obsidian-200 leading-relaxed">
          {children}
        </pre>
      </div>
    ),

    // Links with subtle glow
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-glass-400 hover:text-glass-300 transition-colors underline underline-offset-4 decoration-glass-400/30 hover:decoration-glass-400/60"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),

    // Blockquote with glass styling
    blockquote: ({ children }) => (
      <blockquote className="glass-card my-6 pl-4 pr-6 py-4 border-l-2 border-glass-500/50">
        <div className="text-obsidian-300 italic">
          {children}
        </div>
      </blockquote>
    ),

    // Horizontal rule with gradient
    hr: () => (
      <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-obsidian-700 to-transparent" />
    ),

    // Tables with glass styling
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-white/[0.1]">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-white/[0.05]">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-white/[0.02] transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-medium text-obsidian-200 bg-white/[0.02]">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-obsidian-300">
        {children}
      </td>
    ),

    // Pass through any custom components
    ...components,
  }
}
