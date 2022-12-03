const { spawn } = require('child_process')
const path = require('path')
const process = require('process')

process.env.INPUT_NOTION_TOKEN = process.env.NOTION_TOKEN
process.env.INPUT_DATABASE = '0e8ac22e53844551886265ec0fb6d1a0'
process.env.INPUT_FIELD_TO_MAP_FROM = 'Map From'
process.env.INPUT_FIELD_TO_MAP_TO = 'Lookup Value'
process.env.INPUT_DATABASE_LOOKUP = '9bf9167962c042ad9fc0ee3b9f00c688'
process.env.INPUT_DATABASE_LOOKUP_FIELD = 'Mapping ID'

const ip = path.join(__dirname, 'index.js')
const options = {
  env: process.env
}

const ls = spawn('node', [ip], options)

ls.stdout.on('data', (data) => {
  process.stdout.write(`${data}`)
})

ls.stderr.on('data', (data) => {
  process.stdout.write(`${data}`)
})

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})
