const { GraphQLObjectType, GraphQLID, 
    GraphQLString, GraphQLSchema, 
    GraphQLList, GraphQLNonNull } = require("graphql");
const _ = require('lodash');
const {Pool} = require('pg');

const pgPool = new Pool({
    host: 'localhost',
    user: 'israel',
    port: 5432,
    password: 'rootUser',
    database: 'tech_talent_pool'
});

const ResourceType = new GraphQLObjectType ({
    name: 'Resource',
    fields: () => ({
        id: {type: GraphQLID},
        first_name: {type: GraphQLString},
        last_name: {type: GraphQLString},  
        talent: {
            //type: TalentType,
            type: new GraphQLList(TalentType),
            async resolve(parent){
                const {rows} = await pgPool.query(`SELECT * FROM talent WHERE id = ${parent.talent_id}`);
                return rows;
            }
        }
    })
});

const TalentType = new GraphQLObjectType ({
    name: 'Talent',
    fields: () => ({
        talent: {type: GraphQLString},
        id: {type: GraphQLID},
        resource: {
            //type: ResourceType,
            type: new GraphQLList(ResourceType),
            async resolve(parent){
                const {rows} = await pgPool.query(`SELECT * FROM resource_ WHERE talent_id = ${parent.id}`);
                return rows;
            }
        }
    })
});

const RootQuery = new GraphQLObjectType ({
    name: 'RootQueryType',
    fields: {
        resource: {
            //type: ResourceType,
            type: new GraphQLList(ResourceType),
            args: {id: {type: GraphQLID} },
            async resolve (parent, args){
                const {rows} = await pgPool.query(`SELECT * FROM resource_ WHERE id = ${args.id}`);
                return rows;
            }
        },
        talent: {
            //type: TalentType,
            type: new GraphQLList(TalentType),
            args: {id: {type: GraphQLID} },
            async resolve (parent, args){
               const {rows} = await pgPool.query(`SELECT * FROM talent WHERE id = ${args.id}`);
               return rows;
            }
        },

        resources: {
            type: new GraphQLList(ResourceType),
            async resolve(parent, args){
                const {rows} = await pgPool.query(`SELECT * FROM resource_`);
                return rows;
            }
        },
        talents: {
            type: new GraphQLList(TalentType),
            // type: TalentType,
            async resolve(parent, args){ 
                const {rows} = await pgPool.query(`SELECT * FROM talent`);
                return rows;
            }
        } 
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addTalent: {
            type: TalentType,
            args: {
                talent: {type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args){
                //Sequelize Model Injection should come here
                const {rows} = await pgPool.query(`INSERT INTO talent (talent) VALUES ('${args.talent}') RETURNING *`);
                return rows[0];
            }
        },
        addResource: {
            type: ResourceType,
            args: {
                first_name: {type: new GraphQLNonNull(GraphQLString)},
                last_name: {type: new GraphQLNonNull(GraphQLString)},  
                talent_id: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args){
                //Sequelize Model Injection should come here
                const {rows} = await pgPool.query(`INSERT INTO resource_ (first_name, last_name, talent_id) VALUES ('${args.first_name}', '${args.last_name}', '${args.talent_id}') RETURNING *`);
                return rows[0];
            }
        }
    }
})

module.exports = new GraphQLSchema ({
    query: RootQuery,
    mutation: Mutation
});