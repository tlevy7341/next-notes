import type { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from "../../../utils/prisma";
import { getSession } from "next-auth/react"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    //Get all of the notes from the database
  if (req.method === "GET") {
    try {
      const session = await getSession({ req })
      const email: string = session!.user!.email!;
       const notes = await prisma.notes.findMany({
          where: {
            email: email
          },
           orderBy: {
            createdAt: 'desc',
        },
       });
      res.status(200).json( notes ); 
    } catch (error) {
      res.status(500).json({ error: "Unable to retrieve the notes" });
    } finally {
        prisma.$disconnect();
    }
    //Add a new note to the database
  }  else if (req.method === "POST") {
    try {
        const noteToAdd = JSON.parse(req.body);
         const newNote = await prisma.notes.create({
        data: noteToAdd,
      });   
      res.status(200).json(newNote);
    } catch (error) {
      res.status(500).json({ error: "Unable to save the note" });
    }finally {
        prisma.$disconnect();
    }
    
    //Updates a note 
  }  else if (req.method == "PUT") {
    const updatedData = JSON.parse(req.body);
    try {
        const updatedNote = await prisma.notes.update({
        where: {
          id: updatedData.id,
        },
        data: {
          noteTitle: updatedData.noteTitle,
          noteBody: updatedData.noteBody
        }
      });
      res.status(200).json({ updatedNote }); 
    } catch (error) {
      res.status(500).json({ error: "Unable to delete the note" });
    }finally {
        prisma.$disconnect();
    }
    //Deletes a note from the database
  } else if (req.method == "DELETE") {
    const dataToDelete = JSON.parse(req.body);
    try {
       const deletedNote = await prisma.notes.delete({
        where: {
          id: dataToDelete.id,
        },
      });
      res.status(200).json({ deletedNote }); 
    } catch (error) {
      res.status(500).json({ error: "Unable to delete the note" });
    }finally {
        prisma.$disconnect();
    }
  } 
};

export default handler;
