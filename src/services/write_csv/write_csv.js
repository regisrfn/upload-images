const fs = require('fs')

function filterByKey(blocks, key, value) {
    return blocks.filter(block => block[key] == value)
}

function writeTable(table, separator) {
    var csv_content = ""
    table.forEach(row => {
        var new_row = row.join(separator)
        csv_content += `${row}\r\n`
    })
    try {
        fs.appendFileSync(`${__dirname}/table.csv`, csv_content)
        console.log('The file has been saved!');
    } catch (error) {
        throw error
    }
}


const writeCSV = (data) => {
    var blocks = data['Blocks']
    var tables = filterByKey(blocks, "BlockType", "TABLE")
    var cells = filterByKey(blocks, "BlockType", "CELL")
    var words = filterByKey(blocks, "BlockType", "WORD")

    
    tables.forEach(element => {
        var table = []
        var table_cells = []
        var table_children = element.Relationships
        if (table_children) {
            table_children = table_children[0]
            table_children['Ids'].forEach(children_id => {
                table_cells.push((filterByKey(cells, "Id", children_id)[0]))
            })
        }
        table_cells.forEach(cell => {
            var children = cell.Relationships
            var text = ""
            if (children) {
                children = children[0]
                children['Ids'].forEach(word => {
                    text += `${filterByKey(words, "Id", word)[0].Text} `
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
    })
}

module.exports = { writeCSV }