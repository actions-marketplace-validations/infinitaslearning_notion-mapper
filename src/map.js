const core = require('@actions/core')

let updatedRows = 0
let erroredRows = 0
let ignoredRows = 0

const getText = (richText) => {
  if (richText && richText.length > 0) {
    return richText[0].plain_text
  } else {
    return ''
  }
}

const map = async ({ core, notion, mappedDb, mapFrom, mapTo, lookup, rows }) => {
  for (const row of rows) {
    const lookupFieldValue = getText(row.properties[mapFrom].rich_text)
    const lookupValue = lookup[lookupFieldValue]
    await updateNotionRow(row, lookupValue, { notion, lookupFieldValue, mappedDb, mapTo })
  }
  core.info(`Completed with ${updatedRows} created, ${ignoredRows} skipped and ${erroredRows} with errors`)
}

const updateNotionRow = async (row, lookupValue, { notion, lookupFieldValue, mappedDb, mapTo }) => {
  if (!lookupValue) {
    ignoredRows++
    return
  }
  try {
    const properties = {}
    properties[mapTo] = {
      relation: [
        { id: lookupValue }
      ]
    }

    await notion.pages.update({
      page_id: row.id,
      properties
    })
    updatedRows++
  } catch (ex) {
    erroredRows++
    core.warning(`Error updating row: ${ex.message} ...`)
  }
}

exports.map = map
