import loader from 'loader'

const port = Number(process.env.PORT) || 4900

async function main() {
  const { app } = await loader()

  try {
    const url = await app.listen({
      host: '0.0.0.0',
      port,
    })

    console.log(`🛡 Server started at: ${url} 🛡`)
  } catch (err) {
    console.error({ err }, '🔥 Server start error')
    process.exit(1)
  }
}

main()
