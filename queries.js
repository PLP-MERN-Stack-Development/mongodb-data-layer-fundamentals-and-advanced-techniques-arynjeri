const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; // Replace with your Atlas URI if needed
const client = new MongoClient(uri);

async function runQueries() {
  try {
    await client.connect();
    const db = client.db("plp_bookstore"); // Change to your database name
    const books = db.collection("books");

    // Task 2: Basic CRUD Operations
    console.log("All books:");
    console.log(await books.find({}).toArray());

    console.log("Books by J.D. Salinger:");
    console.log(await books.find({ author: "J.D. Salinger" }).toArray());

    console.log("Books published after 1950:");
    console.log(await books.find({ published_year: { $gt: 1950 } }).toArray());

    console.log("Books in Fiction genre:");
    console.log(await books.find({ genre: "Fiction" }).toArray());

    console.log("Books in stock:");
    console.log(await books.find({ in_stock: true }).toArray());

    console.log("Updating price of 'Animal Farm' to 10.0");
    await books.updateOne({ title: "Animal Farm" }, { $set: { price: 10.0 } });

    console.log("Deleting 'Pride and Prejudice'");
    await books.deleteOne({ title: "Pride and Prejudice" });

    // Task 3: Advanced Queries
    console.log("Books in stock and published after 2010:");
    console.log(await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray());

    console.log("Title, author, price projection:");
    console.log(await books.find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray());

    console.log("Books sorted by price ascending:");
    console.log(await books.find().sort({ price: 1 }).toArray());

    console.log("Books sorted by price descending:");
    console.log(await books.find().sort({ price: -1 }).toArray());

    console.log("Pagination: skip 5, limit 5:");
    console.log(await books.find().skip(5).limit(5).toArray());

    // Task 4: Aggregation Pipeline 
    console.log("Average price by genre:");
    console.log(await books.aggregate([
      { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } },
      { $sort: { averagePrice: -1 } }
    ]).toArray());

    console.log("Author with most books:");
    console.log(await books.aggregate([
      { $group: { _id: "$author", bookCount: { $sum: 1 } } },
      { $sort: { bookCount: -1 } },
      { $limit: 1 }
    ]).toArray());

    console.log("Books grouped by decade:");
    console.log(await books.aggregate([
      {
        $group: {
          _id: { decade: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] } },
          bookCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.decade": 1 } }
    ]).toArray());

    // Task 5: Indexing 
    console.log("Creating index on title");
    await books.createIndex({ title: 1 });

    console.log("Creating compound index on author and published_year");
    await books.createIndex({ author: 1, published_year: -1 });

    console.log("Explain query for 'The Alchemist':");
    console.log(await books.find({ title: "The Alchemist" }).explain("executionStats"));

  } finally {
    await client.close();
  }
}

// Run all queries
runQueries().catch(console.error);