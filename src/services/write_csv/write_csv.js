const fs = require('fs')

function filterByKey(blocks, key, value) {
    var filtered = blocks.filter(block => block[key] == value)

    if (filtered.length == 1) {
        return filtered[0]
    }

    return filtered
}

function writeTable(table, separator) {
    var csv_content = ""
    table.forEach(row => {
        var new_row = row.join(separator)
        csv_content += `${row}\r\n`
    })
    fs.writeFile('table.csv', csv_content, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}


const writeCSV = (data) => {
    var blocks = data['Blocks']
    var tables = filterByKey(blocks, "BlockType", "TABLE")
    var cells = filterByKey(blocks, "BlockType", "CELL")
    var words = filterByKey(blocks, "BlockType", "WORD")


    var table = []
    cells.forEach(cell => {
        var children = cell.Relationships
        var text = ""
        if (children) {
            children = children[0]
            children['Ids'].forEach(word => {
                text = text.concat(filterByKey(words, "Id", word).Text, ' ')
            })
        }
        text = text.slice(0, -1)
        text = text.replace(',', '.')
        if (cell.ColumnIndex == 1) {
            table[cell.RowIndex - 1] = []
        }
        table[cell.RowIndex - 1][cell.ColumnIndex - 1] = text
    })
    writeTable(table)
    return table
}

module.exports = { writeCSV }