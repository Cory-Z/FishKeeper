

const http = require('http')

const hostname = '127.0.0.1'

const port = 3000

const server = http.createServer((req,res) => {
res.statusCode = 200
res.setHeader('Content-type','text/plain')
res.setHeader('Access-Control-Allow-Origin','*')

// const method = req.method
// const url = req.url

const {method, url} = req



// res.write(`Welcome to our web server!`)
// res.write(`Method: ${method}, URL: ${url}`)

if (url === '/getcat' && method === 'GET')
{
res.write(`Here is a cat!`)
}
else if (url === '/getdog' && method === 'GET')
{
res.write(`Here is a dog!`)
}
else if (url === '/additem' && method === 'PUT')
{
res.write(`System updated.`)
}
else
{
res.write(`I don't recognize that request.`)
}

res.end()
}
)

server.listen(port, hostname, () => {
console.log(`Server running at ${hostname}:${port}.`)
})
