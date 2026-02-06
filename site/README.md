# Claude Config Site

A Next.js documentation site with MDX support. Contributors can add content by simply creating markdown files.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Adding Content

### Creating New Pages

Simply create a `.mdx` file in the `app/` directory:

```
app/
├── page.mdx          # Home page (/)
├── docs/
│   └── page.mdx      # Docs page (/docs)
├── commands/
│   └── page.mdx      # Commands page (/commands)
└── your-page/
    └── page.mdx      # Your page (/your-page)
```

### MDX Syntax

Write standard markdown with optional React components:

```mdx
# My Page Title

Regular markdown works as expected.

- Lists
- **Bold text**
- `inline code`

## Using Components

Import and use React components in your markdown:

import { CommandCard } from '@/components/command-card'

<CommandCard name="/example" description="Example command" usage="/example" />
```

### Creating Custom Components

Add components to `components/` directory:

```tsx
// components/my-component.tsx
export function MyComponent({ title }: { title: string }) {
  return <div className="p-4 border rounded">{title}</div>
}
```

Then use in any MDX file:

```mdx
import { MyComponent } from '@/components/my-component'

<MyComponent title="Hello" />
```

## Styling

- Global styles: `app/globals.css`
- Markdown element styles: `mdx-components.tsx`
- Tailwind config: `tailwind.config.js`

## Project Structure

```
site/
├── app/                    # Pages and layouts
│   ├── layout.tsx          # Root layout (header, footer)
│   ├── globals.css         # Global styles
│   └── */page.mdx          # Content pages
├── components/             # React components
├── mdx-components.tsx      # MDX element styling
├── next.config.mjs         # Next.js + MDX config
├── tailwind.config.js      # Tailwind config
└── package.json
```

## Technology

- [Next.js 14](https://nextjs.org/) - React framework
- [@next/mdx](https://nextjs.org/docs/pages/building-your-application/configuring/mdx) - MDX support
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
