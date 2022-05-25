import Airtable, { FieldSet, Records } from 'airtable'
import dotenv from 'dotenv'
dotenv.config()

const { AIRTABLE_API_KEY, AIRTABLE_BASE } = process.env; 
const AIRTABLE_TABLE_NAME = "Alpha Scout"
var base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE!);

export class Airtabler {

  createRecord(twitterLink:string, launchDate:string, author:string) {
    console.log("createRecord()")
    base(AIRTABLE_TABLE_NAME).create([
      {
        "fields": {
          "Twitter Link": twitterLink,
          "Author": author,
          "Launch Date": launchDate
        }
      },
    ], function(err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records?.forEach(function (record) {
        console.log(record.getId());
      });
    });
  }

  findRecord(twitterLink:string) : Promise<Records<FieldSet> | undefined> {
    return new Promise((resolve, reject) => {
      base(AIRTABLE_TABLE_NAME).select({
        view: 'Grid view',
        filterByFormula: `({Twitter Link} = '${twitterLink}')`
      }).firstPage(function(err, records) {
          if (err) { console.error(err); reject(err); }
          resolve(records)
      });
    });
  }

}