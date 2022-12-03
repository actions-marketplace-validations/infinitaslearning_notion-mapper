const core = require('@actions/core')

const loadData = async ({ notion }) => {
  const mappedDb = core.getInput('database')
  const mapFrom = core.getInput('field_to_map_from')
  const mapTo = core.getInput('field_to_map_to')
  const lookupDb = core.getInput('database_lookup')
  const lookupDbField = core.getInput('database_lookup_field')

  const getDatabaseRows = async (databaseId, rowFunction, startCursor) => {
    try {
      const pageRows = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor
      })
      pageRows.results.forEach(rowFunction)
      if (pageRows.has_more) {
        return await getDatabaseRows(databaseId, rowFunction, pageRows.next_cursor)
      }
    } catch (ex) {
      error = true
      core.error(`Failed to retrieve data: ${ex.message}`)
    }
  }

  const lookup = {}
  const rows = []

  const checkField = (structure, field, type, typeDescription) => {
    if (!field || structure[field] !== type) {
      error = true
      core.error(`The field ${field} must exist in the Notion database and be of type ${typeDescription} but instead found ${structure[field]}`)
    }
  }

  let error = false

  if (mappedDb) {
    const dbStructure = await notion.databases.retrieve({
      database_id: mappedDb
    })

    const mapStructure = {}
    Object.keys(dbStructure.properties).forEach((property) => {
      mapStructure[dbStructure.properties[property].name] = dbStructure.properties[property].type
    })

    const lookupDbStructure = await notion.databases.retrieve({
      database_id: lookupDb
    })

    const lookupStructure = {}
    Object.keys(lookupDbStructure.properties).forEach((property) => {
      lookupStructure[lookupDbStructure.properties[property].name] = lookupDbStructure.properties[property].type
    })

    checkField(mapStructure, mapTo, 'relation', 'Relation')
    checkField(lookupStructure, lookupDbField, 'rich_text', 'Text')

    await getDatabaseRows(lookupDb, (row) => {
      if (row.properties[lookupDbField].rich_text.length > 0) {
        const lookupValue = row.properties[lookupDbField].rich_text[0].plain_text
        lookup[lookupValue] = row.id
      }
    })

    await getDatabaseRows(mappedDb, (row) => {
      if (row.properties[mapTo].relation.length === 0 && row.properties[mapFrom].rich_text.length > 0) {
        rows.push(row)
      }
    })
  }

  if (error) {
    process.exit(1)
  }

  return {
    rows,
    mappedDb,
    mapFrom,
    mapTo,
    lookup
  }
}

exports.loadData = loadData
