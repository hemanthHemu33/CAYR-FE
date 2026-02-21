import { Link } from 'react-router-dom'

type PagePlaceholderProps = {
  title: string
  legacyFiles: string[]
}

export default function PagePlaceholder({ title, legacyFiles }: PagePlaceholderProps) {
  return (
    <section className="page-card">
      <h2>{title}</h2>
      <p>This page is queued for migration from the legacy project.</p>
      <ul>
        {legacyFiles.map((file) => (
          <li key={file}>
            <code>{file}</code>
          </li>
        ))}
      </ul>
      <Link to="/">Back</Link>
    </section>
  )
}
