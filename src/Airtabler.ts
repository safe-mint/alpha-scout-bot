import Airtable, { FieldSet, Records } from 'airtable'

const { AIRTABLE_API_KEY, AIRTABLE_BASE, AIRTABLE_TABLE_NAME } = process.env; 
var base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE!);

export class Airtabler {

  async createRecord(twitterLink:string, launchDate:string, author:string) : Promise<Records<FieldSet> | undefined> {
    console.log("createRecord")
    const records = await base(AIRTABLE_TABLE_NAME!).create([
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
      base(AIRTABLE_TABLE_NAME!).select({
        view: 'Grid view',
        filterByFormula: `(LOWER({Twitter Link}) = '${twitterLink.toLowerCase()}')`
      }).firstPage(function(err, records) {
          if (err) { console.error(err); reject(err); }
          resolve(records)
      });
    });
  }

}