import neo4j from 'neo4j-driver';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(1));

var driver;
if((argv['neo4juser']==undefined) && (argv['neo4jpass']==undefined)) {
    driver = neo4j.driver('bolt://localhost',
        neo4j.auth.basic('neo4j', 'test'));
} else {
    let uri = 'neo4j+s://306a8251.databases.neo4j.io';
    let user = argv['neo4juser']
    let password = argv['neo4jpass']
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
}


export const neo4Driver = driver;