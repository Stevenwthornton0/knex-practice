const ShoppingListServices = require('../src/shopping-list-service');
const knex = require('knex');

describe('Shopping list service object', function() {
  let db;
  let testList = [
    {
      id: 1,
      name: 'Fish tricks',
      price: '13.10',
      category: 'Main',
      checked: false,
      date_added: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2, 
      name: 'Not dogs',
      price: '4.99',
      category: 'Snack',
      checked: true,
      date_added: new Date('2100-05-22T16:28:32.615Z')
    },
    {
      id: 3,
      name: 'Buffalo Wings',
      price: '5.50',
      category: 'Snack',
      checked: false,
      date_added: new Date('1919-12-22T16:28:32.615Z')
    }
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  })

  before(() => db('shopping_list').truncate())

  afterEach(() => db('shopping_list').truncate())

  after(() => db.destroy())

  context(`Given 'shopping_list' has data`, () => {
    beforeEach(() => {
      return db
        .into('shopping_list')
        .insert(testList);
    })

    it(`getAllItems() resolved all items from 'shopping_list' table`, () => {
      return ShoppingListServices.getAllItems(db)
        .then(actual => {
          expect(actual).to.eql(testList)
        });
    })

    it(`getItemById() resolves an item by id from 'shopping_list' table`, () => {
      const thirdId = 3;
      const thirdTestItem = testList[thirdId - 1];
      return ShoppingListServices.getItemById(db, thirdId)
        .then(actual => {
          expect(actual).to.eql({
            id: thirdId,
            name: thirdTestItem.name,
            price: thirdTestItem.price,
            category: thirdTestItem.category,
            checked: thirdTestItem.checked,
            date_added: thirdTestItem.date_added
          })
        })
    })

    it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
      const itemId = 3;
      return ShoppingListServices.deleteItem(db, itemId)
        .then(() => 
          ShoppingListServices.getAllItems(db))
        .then(allItems => {
          const expected = testList.filter(item => item.id !== itemId);
          expect(allItems).to.eql(expected)
        })
    })

    it(`updateItem() updates an item from the 'shopping_list' table`, () => {
      const idOfItemToUpdate = 3;
      const newItemData = {
        name: 'updated name',
        price: '1000.00',
        category: 'Lunch',
        checked: true,
        date_added: new Date()
      };
      return ShoppingListServices.updateItem(db, idOfItemToUpdate, newItemData)
        .then(() => ShoppingListServices.getItemById(db, idOfItemToUpdate))
        .then(item => {
          expect(item).to.eql({
            id: idOfItemToUpdate,
            ...newItemData
          })
        })
    })
  })

  context(`Given 'shopping_list' has no data`, () => {
    it(`getAllItems() resolves an empty array`, () => {
      return ShoppingListServices.getAllItems(db)
        .then(actual => {
          expect(actual).to.eql([])
        })
    })

    it(`insertItem() inserts a new item and resolved the new item with an id`, () => {
      const newItem = {
        name: 'Test new name',
        price: '10.00',
        category: 'Lunch',
        checked: true,
        date_added: new Date('2020-01-01T00:00:00.000Z')
      };
      return ShoppingListServices.insertItem(db, newItem)
        .then(actual => {
          expect(actual).to.eql({
            id: 1,
            name: newItem.name,
            price: newItem.price,
            category: newItem.category,
            checked: newItem.checked,
            date_added: newItem.date_added
          })
        })
    })
  })
});