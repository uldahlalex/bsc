import * as cypherReader from './../infrastructure/infrastructure.reads';
import * as cypherWriter from './../infrastructure/infrastructure.writes';
import {faker} from '@faker-js/faker';

/**
 * Script to seed DB so test user has some data
 */
export function seed() {
    cypherReader.getOrganizationByName('Test Organization').then(res => {
        if (res.length<1) {
            console.log('Seeding test organization with some data')
            cypherWriter.createOrganization('Test Organization').then(org => {
                cypherWriter.createProjectForOrganization(org._fields[0]._id.low, 'Test Project', 'Test description').then(project => {
                    console.log(project._id.low)
                    for (let i = 0; i < 5; i++) {
                        cypherWriter.createTaskForProject("507f191e810c19729de860ea", org._fields[0]._id.low, project._id.low, faker.git.commitMessage(), faker.lorem.paragraph());
                    }

                })
            })
        }
    })

}