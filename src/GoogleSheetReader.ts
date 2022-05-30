import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library';

const SHEET_NAME = "ML NFT Calendar - Cycle 1"


export class GoogleSheetReader {
  spreadsheetId: string
  constructor() {
    if(!process.env.GOOGLE_SHEET_MIDNIGHT_LABS_ID) {
      throw new Error("no env variable GOOGLE_SHEET_MIDNIGHT_LABS_ID")
    }
    this.spreadsheetId = process.env.GOOGLE_SHEET_MIDNIGHT_LABS_ID!
  }

  async readData() : Promise<Array<string> | undefined> {
    const keyFile = "keys.json"
    const auth = await google.auth.getClient({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })
    const spreadsheetId = this.spreadsheetId
    const sheets = google.sheets({ version: "v4" });
    const readData = await sheets.spreadsheets.values.get({
      auth, //auth object
      spreadsheetId, // spreadsheet id
      range: `${SHEET_NAME}!C:C`, //range of cells to read from.
    })
    const values = readData?.data?.values?.map(x => x[0]?.trim()?.toLowerCase())
    return values
  }
}