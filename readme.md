# Notion Database Mapper

This action will go through a Notion database (with specific fields), and create a relation for a mapped field based on a second table - think of it a bit like a magic formula relation :D

## Notion integration and token

First, you need to have an integration access token - which you can get from https://www.notion.so/my-integrations after creating an integration.  Give the integration a friendly name like 'Github Actions'.

By default integrations cant access any content so you you *must* share your database (or the parent page / tree it is contained within) with the integration you created earlier to be able to access it.

## Notion Databases

This action expects a source Notion database with at least two field, one to map from, the other to map to.  You can specify the columns, the column to map to *must* be a relation to the second database specified below.

You can see an example here: https://infinitaslearning.notion.site/Mapper-d2c44b00230c4a4a8372f46a947ef0c1

The second database to provide is the lookup table. It will lookup the `map_from` field in the `lookup_field` of the second database, get the ID of the row, and update the initial table with the relation.

## Usage

This is typically deployed as a scheduled action:

```yaml
name: Mapper
on:
  schedule:
    - cron:  '30 5 * * *'
  workflow_dispatch:
jobs:
  catalog:
    runs-on: ubuntu-latest
    steps:
     - name: Notion Mapper  
       uses: infinitaslearning/notion-mapper@main        
       with:          
         notion_token: ${{ secrets.NOTION_TOKEN }}
         database: 0e8ac22e53844551886265ec0fb6d1a0             
         field_to_map_from: 'Map From'
         field_to_map_to: 'Lookup Value'
         database_lookup: 9bf9167962c042ad9fc0ee3b9f00c688
         database_lookup_field: 'Mapping ID'

```

To get the database ID, simply browse to it, click on the '...' in Notion, and get a 'Copy link'.  The GUID at the end of the URL (but before the `?v=`) is the id, this works on both embedded and full page databases.

## Development

Assumes you have `@vercel/ncc` installed globally.
After changes ensure you `npm run build`, commit and then submit a PR.

For the tests to run you need to have the environment variables set for GITHUB_TOKEN, NOTION_TOKEN and NOTION_DATABASE.
