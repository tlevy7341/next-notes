import React, { useRef, useState } from "react";
import { FaTimes, FaLongArrowAltRight } from "react-icons/fa";
import useOnClickOutside from "use-onclickoutside";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQueryClient } from "react-query";
import { motion } from "framer-motion";

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

  // Ref for the Text Area
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  //Variables to handle the form
  const formRef = useRef(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    clearErrors,
  } = useForm<FormData>();
  const { ref, ...rest } = register("noteBody", {
    required: "Note Body is required",
  });

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
      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData("notes");
      // Optimistically update to the new value
      queryClient.setQueryData("notes", (prevNotes: any) => {
        return [noteToAdd, ...prevNotes];
      });
      // Return a context object with the snapshotted value
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

  //Extends the Textarea as the text grows
  const onChangeHandler = function (e: any) {
    clearErrors();
    const target = e.target as HTMLTextAreaElement;
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "50px";
      textAreaRef.current.style.height = `${target.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col justify-center  items-center pt-10">
      <motion.span
        animate={
          errors.noteTitle?.message || errors.noteBody?.message
            ? { opacity: 1 }
            : { opacity: 0 }
        }
        transition={{ duration: 0.2 }}
        className="text-red-500 font-semibold pb-2"
      >
        {/* Display error message if there is one */}
        {errors.noteTitle?.message || errors.noteBody?.message}
      </motion.span>
      <form
        ref={formRef}
        onSubmit={handleSubmit(submitNote)}
        className="flex sm:(shadow-lg shadow-blue-gray-900) flex-col w-full px-4 sm:px-0 sm:w-1/3"
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
            {...register("noteTitle", { required: "Note Title is required" })}
            onChange={() => clearErrors()}
          />
          {isExpanded && (
            <motion.button
              whileHover={{ scale: 1.2 }}
              className="text-red-500"
              onClick={closeInput}
            >
              <FaTimes />
            </motion.button>
          )}
        </div>
        <motion.div
          initial={{ height: 0 }}
          animate={isExpanded ? { height: 100 } : { height: 0 }}
          transition={{ duration: 0.25 }}
          className={`border border-y-0 border-cool-gray-100 `}
        >
          <textarea
            className={`px-5 pt-2 bg-blue-gray-800 w-full outline-none overflow-hidden resize-none ${
              isExpanded ? "block" : "hidden"
            }`}
            placeholder="Take a note..."
            {...rest}
            ref={(e) => {
              ref(e);
              textAreaRef.current = e;
            }}
            onChange={onChangeHandler}
          />
        </motion.div>
        {isExpanded && (
          <div className="flex justify-end border rounded-b border-t-0 border-cool-gray-100 p-2">
            <motion.button
              whileHover={{ scale: 1.2 }}
              type="submit"
              className="pr-2 text-teal-700"
            >
              <FaLongArrowAltRight />
            </motion.button>
          </div>
        )}
      </form>
    </div>
  );
};

export default NoteForm;
