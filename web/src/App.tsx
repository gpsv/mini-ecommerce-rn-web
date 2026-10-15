// Temporary smoke test for design tokens (P03); replaced by the catalog pages.
function App() {
  return (
    <main className="min-h-screen bg-background p-4">
      <article className="flex max-w-sm flex-col gap-2 rounded-lg bg-surface p-4 shadow-card">
        <h2 className="text-title text-text">Mochila Fjallraven</h2>
        <p className="text-price-md text-price">$109.95</p>
        <button
          type="button"
          className="h-touch rounded-md bg-primary text-body text-primary-foreground"
        >
          Agregar
        </button>
      </article>
    </main>
  )
}

export default App
