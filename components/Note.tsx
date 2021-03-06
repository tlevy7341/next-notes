import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaSave } from "react-icons/fa";
import useOnClickOutside from "use-onclickoutside";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

type NoteType = {
  id: string;
  email: string;
  noteTitle: string;
  noteBody: string;
};
//Type for the Form
type FormData = {
  noteTitle: string;
  noteBody: string;
};

const Note = ({ id, email, noteTitle, noteBody }: NoteType) => {
  const [isSelected, setIsSelected] = useState(false);
  const textAreaRef = useRef<any>(null);
  const clickRef = useRef(null);
  const inputRef = useRef<any>(null);

  //Variables to handle the form
  const {
    register,
    formState: { errors, isDirty, isSubmitted },
    handleSubmit,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      noteTitle,
      noteBody,
    },
  });
  const { ref: noteTitleRef, ...titleProps } = register("noteTitle", {
    required: "Note Title is required",
  });
  const { ref: noteBodyRef, ...bodyProps } = register("noteBody", {
    required: "Note Body is required",
  });

  const handleOnNoteClicked = (e: any) => {
    setIsSelected(true);
    if (
      (e.target instanceof SVGElement ||
        e.target instanceof HTMLButtonElement) &&
      !errors
    ) {
      setIsSelected(false);
    }

    if (inputRef.current && textAreaRef.current) {
      inputRef.current.readOnly = false;
      textAreaRef.current.readOnly = false;
    }
  };

  const submitNote = (formData: FormData) => {
    const updatedNote = {
      id,
      email,
      noteTitle: formData.noteTitle.trimEnd(),
      noteBody: formData.noteBody.trimEnd(),
    };
    updateMutation.mutate(updatedNote);
  };

  //Checks to see if there was a click outside of the note. Then sets
  useOnClickOutside(clickRef, () => {
    if (inputRef.current && textAreaRef.current) {
      inputRef.current.readOnly = true;
      textAreaRef.current.readOnly = true;
    }
    setIsSelected(false);
    if (!isSubmitted && isDirty) {
      reset();
    }
  });

  //Function to update a note
  const updateNote = (noteToUpdate: NoteType) => {
    return fetch("/api/notes", {
      method: "PUT",
      body: JSON.stringify(noteToUpdate),
    });
  };

  const updateMutation = useMutation(updateNote, {
    onMutate: (updatedNote: NoteType) => {
      setIsSelected(false);
      const previousNotes = queryClient.getQueryData("notes");
      queryClient.setQueryData(["notes", updatedNote.id], updatedNote);
      return { previousNotes };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newNote: NoteType, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData("notes", context.previousNotes);
      }
    },
    onSettled: () => {
      if (inputRef.current && textAreaRef.current) {
        inputRef.current.readOnly = false;
        textAreaRef.current.readOnly = false;
      }
      queryClient.invalidateQueries();
    },
  });

  //Function for deleting a note
  const deleteNote = (noteToDelete: NoteType) => {
    return fetch("/api/notes", {
      method: "DELETE",
      body: JSON.stringify(noteToDelete),
    });
  };

  //Update the cache
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(deleteNote, {
    onMutate: (deletedNote: NoteType) => {
      const previousNotes = queryClient.getQueryData("notes");
      queryClient.setQueryData("notes", (prevNotes: any) => {
        return prevNotes.filter((note: NoteType) => note.id !== deletedNote.id);
      });
      return { previousNotes };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newNote: NoteType, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData("notes", context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries("notes");
    },
  });

  useEffect(() => {
    //Sets the height of the note based on the content
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, []);

  return (
    <motion.div animate={isSelected ? { scale: 1.1 } : { scale: 1 }}>
      <motion.div
        animate={
          errors.noteTitle?.message || errors.noteBody?.message
            ? { opacity: 1 }
            : { opacity: 0 }
        }
        transition={{ duration: 0.2 }}
        className="text-red-500 text-sm font-semibold sm:(pb-6 !m-0 h-4)"
      >
        {/* Display error message if there is one */}
        {errors.noteTitle?.message || errors.noteBody?.message}
      </motion.div>
      <form
        onSubmit={handleSubmit(submitNote)}
        ref={clickRef}
        onClick={(e) => handleOnNoteClicked(e)}
        className={`flex flex-col border border-cool-gray-100 shadow-md shadow-blue-gray-900 rounded`}
      >
        <input
          className="outline-none bg-blue-gray-800 text-cool-gray-100 font-semibold px-3 py-1"
          readOnly
          autoComplete="off"
          ref={(e) => {
            noteTitleRef(e);
            inputRef.current = e;
          }}
          {...titleProps}
        />
        <textarea
          className="overflow-hidden resize-none outline-none bg-blue-gray-800 text-cool-gray-100 px-3 py-2 mt-1"
          readOnly
          ref={(e) => {
            noteBodyRef(e);
            textAreaRef.current = e;
          }}
          {...bodyProps}
        />
        <div
          className={`flex justify-between pt-2  ${
            isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => {
              deleteMutation.mutate({ id, email, noteTitle, noteBody });
            }}
            className={`mx-3 my-1 text-sm ${
              isSelected ? "cursor-pointer" : "cursor-default"
            } `}
          >
            <FaTrash className="text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            type="submit"
            className={`text-teal-700 mx-3 my-1 ${
              isSelected ? "cursor-pointer" : "cursor-default"
            } `}
          >
            <FaSave />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default Note;
