import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaSave } from "react-icons/fa";
import useOnClickOutside from "use-onclickoutside";
import { useMutation, useQueryClient } from "react-query";

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
  const [inputText, setInputText] = useState(noteTitle);
  const [textAreaText, setTextAreaText] = useState(noteBody);
  const textareaRef = useRef<any>(null);
  const clickRef = useRef(null);
  const inputRef = useRef<any>(null);

  const handleOnNoteClicked = (e: any) => {
    setIsSelected(true);
    if (
      e.target instanceof SVGElement ||
      e.target instanceof HTMLButtonElement
    ) {
      setIsSelected(false);
    }

    if (inputRef.current && textareaRef.current) {
      inputRef.current.readOnly = false;
      textareaRef.current.readOnly = false;
    }
  };

  //Checks to see if there was a click outside of the note. Then sets
  useOnClickOutside(clickRef, () => {
    if (inputRef.current && textareaRef.current) {
      inputRef.current.readOnly = true;
      textareaRef.current.readOnly = true;
    }
    setIsSelected(false);
  });

  /*  const onUpdateNote = () => {
    setIsSelected(false);
    if (inputRef.current && textareaRef.current) {
      inputRef.current.readOnly = false;
      textareaRef.current.readOnly = false;
    }
    if (inputText !== "" || textAreaText !== "") {
      
    }
  }; */

  //Function for deleting a note
  const deleteNote = (noteToDelete: NoteType) => {
    return fetch("/api/notes", {
      method: "DELETE",
      body: JSON.stringify(noteToDelete),
    });
  };

  //Update the cache
  const queryClient = useQueryClient();
  const { mutate } = useMutation(deleteNote, {
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, []);

  return (
    <div
      ref={clickRef}
      onClick={(e) => handleOnNoteClicked(e)}
      className={`flex flex-col border border-cool-gray-100 shadow-md shadow-blue-gray-900 rounded`}
    >
      <input
        ref={inputRef}
        onChange={(e) => setInputText(e.target.value)}
        className="outline-none bg-blue-gray-800 text-cool-gray-100 font-semibold px-3 py-1"
        type="text"
        value={inputText}
        readOnly
      />
      <textarea
        ref={textareaRef}
        onChange={(e) => setTextAreaText(e.target.value)}
        className="overflow-hidden resize-none outline-none bg-blue-gray-800 text-cool-gray-100 px-3 py-2 mt-1"
        value={textAreaText}
        readOnly
      />
      <div
        className={`flex justify-between  ${
          isSelected ? "opacity-100 transition" : "opacity-0 transition"
        }`}
      >
        <button
          onClick={() => {
            mutate({ id, email, noteTitle, noteBody });
          }}
          className={`mx-3 my-1 ${
            isSelected ? "cursor-pointer" : "cursor-default"
          } `}
        >
          <FaTrash className="text-red-500" />
        </button>
        <button
          type="submit"
          className={`text-green-800 mx-3 my-1 ${
            isSelected ? "cursor-pointer" : "cursor-default"
          } `}
        >
          <FaSave />
        </button>
      </div>
    </div>
  );
};

export default Note;
