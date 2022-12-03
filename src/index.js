const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { loadData } = require('./data')
const { map } = require('./map')

try {
  const NOTION_TOKEN = core.getInput('notion_token')

  core.debug('Creating notion client ...')
  const notion = new Client({
    auth: NOTION_TOKEN,
    logLevel: LogLevel.ERROR
  })

  const refreshData = async () => {
    core.startGroup('🗂️  Loading data to map ...')
    const {
      mappedDb,
      mapFrom,
      mapTo,
      lookup,
      rows
    } = await loadData({ core, notion })
    core.info(`Found ${rows.length} rows in the database to map`)
    core.endGroup()
    core.startGroup(`🗂️  Mapping ${rows.length} rows ...`)
    await map({ core, notion, mappedDb, mapFrom, mapTo, lookup, rows })
    core.endGroup()
  }

  refreshData()
} catch (error) {
  core.setFailed(error.message)
}
