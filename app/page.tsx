import Link from 'next/link'

const tools = [
  { name: 'Fightstick Friday Generator', href: '/create/fightstick-friday' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-4xl font-black uppercase text-[#ff2255] tracking-tight leading-none mb-8">
        Tools
      </h1>
      <ul className="flex flex-col">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block border-2 border-[#ff2255] px-4 py-3 text-sm font-bold uppercase text-[#ff2255] hover:bg-[#ff2255] hover:text-black transition-colors"
            >
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
