import fs from 'fs'
const storeData = fs.readFileSync('whereFileIsLocated',{flag:'r'})
setData(JSON.parse(string(storeData)));