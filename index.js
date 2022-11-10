const express = require('express');
const schema = require('./schema/schema');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const {Pool} = require('pg');
const cors = require('cors');

const pgPool = new Pool({
    // host: 'localhost',
    // user: 'sail',
    // port: 5432,
    // password: '1234567890',
    // database: 'tech_talent_pool'

    host: 'localhost',
    user: 'israel',
    port: 5432,
    password: 'rootUser',
    database: 'tech_talent_pool'
});


const app = express();

app.use(cors())

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql:true
}));



pgPool.connect().then( ()=> {
        app.listen(4000, ()=> {
            console.log(`Your Server is Running on PORT 4000`);
        });
    })
    .catch((error)=>{
        console.log(error);
    })

