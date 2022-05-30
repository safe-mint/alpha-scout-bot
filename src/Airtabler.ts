import Airtable, { FieldSet, Records } from 'airtable'
import dotenv from 'dotenv'
dotenv.config()

const { AIRTABLE_API_KEY, AIRTABLE_BASE } = process.env; 
const AIRTABLE_TABLE_NAME = "Alpha Scout"
var base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE!);

export class Airtabler {
  tableName: string

  constructor(tableName = AIRTABLE_TABLE_NAME) {
    this.tableName = tableName
  }

  async createRecord(twitterLink:string, launchDate:string, author:string) : Promise<Records<FieldSet> | undefined> {
    const records = await base(this.tableName).create([
      {
        "fields": {
          "Twitter Link": twitterLink,
          "Author": author,
          "Launch Date": launchDate
        }
      },
    ])
    return records
  }

  findRecord(twitterLink:string) : Promise<Records<FieldSet> | undefined> {
    return new Promise((resolve, reject) => {
      base(this.tableName).select({
        view: 'Grid view',
        filterByFormula: `({Twitter Link} = '${twitterLink}')`
      }).firstPage(function(err, records) {
          if (err) { console.error(err); reject(err); }
          resolve(records)
      });
    });
  }

}