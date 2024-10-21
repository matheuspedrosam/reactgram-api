const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;
async function main() {
    await mongoose.connect(dbUrl);
    console.log("Conectou ao mongoDB com Mongoose!");
}

main().catch(e => console.log(e));

module.exports = mongoose;