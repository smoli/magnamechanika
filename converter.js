const csv = require("csv-parser");
const fs = require('fs')

const words = [];

const output = fs.createWriteStream("newWords.txt");

fs.createReadStream('germannouns.csv')
    .pipe(csv())
    .on('data', data => {
        if (data.pos === "Substantiv") {
            words.push(data.lemma);
            output.write(data.lemma + "\n");
        }
    })
    .on('end', () => {
        console.log("Done", words.length, "words");
        output.close();
    });


