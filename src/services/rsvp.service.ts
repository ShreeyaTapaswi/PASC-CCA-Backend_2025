import { PrismaClient } from '@prisma/client';
import { RsvpWithUser } from 'src/types/rsvp.types';

const Prisma = new PrismaClient() ;

export const getRsvpsByEventId = async (eventId: number) : Promise<RsvpWithUser[]> =>{
    const rsvps = await Prisma.rsvp.findMany({
        where : {eventId} ,
        include : {
            user : {
                select : {
                    id : true ,
                    name : true ,
                    email : true ,
                }
            }
        },
    });

    return rsvps ;
}