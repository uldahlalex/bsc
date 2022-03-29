import * as mongooseRead from "../infrastructure/infrastructure.reads";
import * as mongooseWrite from "../infrastructure/infrastructure.writes";
import bcrypt from "bcryptjs";


export async function writeUser() {
    const user = await mongooseRead.findUser("test@user.dk");
    if (!user) {
        console.log('Seeding a mock user to DB for testing purposes. Please sign in with test@user.dk password 1234.')
        await mongooseWrite.registerUser("test", "test", "test@user.dk", await bcrypt.hash("1234", 10), ["Member"], 0, "507f191e810c19729de860ea")
    }
}
