import React, { useRef, useState, useEffect } from "react";
import { FaTimes, FaLongArrowAltRight } from "react-icons/fa";
import useOnClickOutside from "use-onclickoutside";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQueryClient } from "react-query";

//Type for the Form
type FormData = {
  noteTitle: string;
  noteBody: string;
};

type NoteType = {
  id: string;
  email: string;
  noteTitle: string;
  noteBody: string;
  createdAt: Date;
};

type EmailType = {
  email: string;
};

const NoteForm = ({ email }: EmailType) => {
  //Variable to control the textarea being shown
  const [isExpanded, setIsExpanded] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  //Variables to handle the form

  const formRef = useRef(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormData>();
  const { ref, ...rest } = register("noteBody", { required: true });

  //Function to send the new note to the server
  const addNote = (newNote: NoteType) => {
    return fetch("/api/notes", {
      method: "POST",
      body: JSON.stringify(newNote),
    });
  };

  //Function to handle the form submission
  const submitNote = (data: FormData) => {
    const newNote: NoteType = {
      id: uuidv4(),
      email,
      noteTitle: data.noteTitle,
      noteBody: data.noteBody,
      createdAt: new Date(),
    };
    mutate(newNote);
  };

  //Function to close the TextArea
  const closeInput = () => {
    //Close the TextArea
    setIsExpanded(false);
    //Reset form
    reset();
  };

  //Hook to check if there was a click outside of the Form element and then calls the closeInput function
  useOnClickOutside(formRef, closeInput);

  //Update the cache
  const queryClient = useQueryClient();
  const { mutate } = useMutation(addNote, {
    //Update the UI prior to the cache updating
    onMutate: (noteToAdd: NoteType) => {
      closeInput();
      const previousNotes = queryClient.getQueryData("notes");
      queryClient.setQueryData("notes", (prevNotes: any) => {
        return [noteToAdd, ...prevNotes];
      });
      return { previousNotes };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newNote: NoteType, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData("notes", context.previousNotes);
      }
    },
    //Reloads the cache with the updated notes
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
    <div className="flex flex-col justify-center  items-center pt-10">
      <span className="text-red-500 font-semibold pb-2">
        {(errors.noteTitle || errors.noteBody) && "Required Fields are missing"}
      </span>
      <form
        ref={formRef}
        onSubmit={handleSubmit(submitNote)}
        className="flex shadow-lg shadow-blue-gray-900 flex-col w-full px-4 sm:px-0 sm:w-1/3"
      >
        <div
          className={`flex border ${
            isExpanded ? "border-b-0 rounded-b-none" : null
          }  border-cool-gray-100 rounded pr-3`}
        >
          <input
            onClick={() => {
              setIsExpanded(true);
            }}
            className={`px-5 flex-1 py-2 bg-blue-gray-800 outline-none `}
            placeholder={isExpanded ? "Title" : "Take a note..."}
            autoComplete="off"
            {...register("noteTitle", { required: true })}
          />
          {isExpanded && (
            <button onClick={closeInput}>
              <FaTimes />
            </button>
          )}
        </div>
        <textarea
          className={`px-5 pt-2 bg-blue-gray-800 outline-none overflow-hidden border border-y-0 border-cool-gray-100 resize-none ${
            isExpanded ? "block" : "hidden"
          }`}
          placeholder="Take a note..."
          {...rest}
          ref={(e) => {
            ref(e);
            textAreaRef.current = e;
          }}
        />
        {isExpanded && (
          <div className="flex justify-end border rounded-b border-t-0 border-cool-gray-100 p-2">
            <button type="submit" className="pr-2">
              <FaLongArrowAltRight />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default NoteForm;
