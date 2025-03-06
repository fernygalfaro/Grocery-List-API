const express = require('express');
const fs = require('fs');
const {logger} = require('./util/logger');

const app = express();
const PORT = 3000;
const DATA_FILE = 'grocery_list.json';


app.use(express.json());

let groceryList = [];
if (fs.existsSync(DATA_FILE)) {
    groceryList = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save grocery list to file
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(groceryList, null, 2));
}

// GET - View grocery list
app.get('/groceries', (req, res) => {
    res.json(groceryList);
});

// POST - Add item to grocery list
app.post('/groceries', (req, res) => {
    const { name, price, quantity, purchased } = req.body;
    if (!name || price == null || quantity == null) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newItem = { id: Date.now(), name, price, quantity, purchased: purchased || false };
    groceryList.push(newItem);
    saveData();
    logger.info(`Item added: ${JSON.stringify(newItem)}`);
    res.status(201).json(newItem);
});

// PUT - Edit an item
app.put('/groceries/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, quantity, purchased } = req.body;
    const index = groceryList.findIndex(item => item.id == id);
    
    if (index === -1) return res.status(404).json({ message: 'Item not found' });
    
    groceryList[index] = { ...groceryList[index], name, price, quantity, purchased };
    saveData();
    logger.info(`Item updated: ${JSON.stringify(groceryList[index])}`);
    res.json(groceryList[index]);
});

// DELETE - Remove an item
app.delete('/groceries/:id', (req, res) => {
    const { id } = req.params;
    const index = groceryList.findIndex(item => item.id == id);
    
    if (index === -1) return res.status(404).json({ message: 'Item not found' });
    
    const deletedItem = groceryList.splice(index, 1);
    saveData();
    logger.info(`Item deleted: ${JSON.stringify(deletedItem[0])}`);
    res.json(deletedItem[0]);
});

app.listen(PORT, () => {
    console.info(`Server is listening on http://localhost:${PORT}`);
});