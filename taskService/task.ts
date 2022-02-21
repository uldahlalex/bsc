import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne} from "typeorm";

@Entity()
export class Task {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    desc: string;

    @Column()
    authorId: string;

    @Column()
    rank: number;

    @Column()
    projectId: number;

}
@Entity()
export class TaskRelation {

    @PrimaryColumn()
    superTask: number;

    @PrimaryColumn()
    subTask: number;

}