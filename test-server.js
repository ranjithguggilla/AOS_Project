import http from 'http'

const port = process.env.PORT || 5001
const host = '0.0.0.0'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('OK')
})

server.listen(port, host, () => {
  console.log(`Test server running on ${host}:${port}`)
})
