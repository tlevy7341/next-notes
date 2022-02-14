import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaSave } from "react-icons/fa";
import useOnClickOutside from "use-onclickoutside";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";

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
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormData>();
  const { ref: noteTitleRef, ...titleProps } = register("noteTitle", {
    required: true,
  });
  const { ref: noteBodyRef, ...bodyProps } = register("noteBody", {
    required: true,
  });

  const handleOnNoteClicked = (e: any) => {
    setIsSelected(true);
    if (
      e.target instanceof SVGElement ||
      e.target instanceof HTMLButtonElement
    ) {
      setIsSelected(false);
    }

    if (inputRef.current && textAreaRef.current) {
      inputRef.current.readOnly = false;
      textAreaRef.current.readOnly = false;
    }
  };

  const submitNote = (formData: FormData) => {
    const updatedNote = { id, email, ...formData };
    updateMutation.mutate(updatedNote);
  };

  //Checks to see if there was a click outside of the note. Then sets
  useOnClickOutside(clickRef, () => {
    if (inputRef.current && textAreaRef.current) {
      inputRef.current.readOnly = true;
      textAreaRef.current.readOnly = true;
    }
    setIsSelected(false);
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
      setIsSelected(false);
      if (inputRef.current && textAreaRef.current) {
        inputRef.current.readOnly = false;
        textAreaRef.current.readOnly = false;
      }
      queryClient.invalidateQueries("notes");
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
        defaultValue={noteTitle}
        {...titleProps}
      />
      <textarea
        className="overflow-hidden resize-none outline-none bg-blue-gray-800 text-cool-gray-100 px-3 py-2 mt-1"
        readOnly
        ref={(e) => {
          noteBodyRef(e);
          textAreaRef.current = e;
        }}
        defaultValue={noteBody}
        {...bodyProps}
      />
      <div
        className={`flex justify-between pt-2  ${
          isSelected ? "opacity-100 transition" : "opacity-0 transition"
        }`}
      >
        <button
          onClick={() => {
            deleteMutation.mutate({ id, email, noteTitle, noteBody });
          }}
          className={`mx-3 my-1 ${
            isSelected ? "cursor-pointer" : "cursor-default"
          } `}
        >
          <FaTrash className="text-red-500" />
        </button>
        <button
          type="submit"
          className={`text-teal-700 mx-3 my-1 ${
            isSelected ? "cursor-pointer" : "cursor-default"
          } `}
        >
          <FaSave />
        </button>
      </div>
    </form>
  );
};

export default Note;
