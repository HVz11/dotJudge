import React, { useEffect, useRef, useState } from "react";
import Codemirror, { EditorFromTextArea } from "codemirror";
import "codemirror/theme/idea.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import stub from "../codeStudio";
import { useDispatch } from "react-redux";
import { setCurrentCode, setCurrentLang } from "../store/CodeSlice";
import { useLocation } from "react-router-dom";


export default function Editor() {
  const EditorRef = useRef<EditorFromTextArea>();
  const [language, setLanguage] = useState("cpp");
  const [stubs, setStubs] = useState(stub);
  const dispatch = useDispatch();
  const location = useLocation().pathname.split("/")[2];

  useEffect(() => {
    const localLanguage = localStorage.getItem("language");
    let curLang = language;
    let localCode;
    if (localLanguage !== null) {
      setLanguage(localLanguage);
      curLang = localLanguage;
      localCode = JSON.parse(
        localStorage.getItem(`${location}-${localLanguage}-code`) as string
      );
    } else
      localCode = JSON.parse(
        localStorage.getItem(`${location}-${language}-code`) as string
      );
    const temp = { ...stubs };
    temp[curLang] = localCode || (stub[curLang] as string);
    setStubs(temp);
    dispatch(setCurrentLang(curLang));
    dispatch(setCurrentCode(temp[curLang]));
  }, [location]);

  useEffect(() => {
    const init = () => {
      // Initialize Codemirror

      const editorId = document.getElementById(
        "realtimeEditor"
      ) as HTMLTextAreaElement;

      EditorRef.current = (Codemirror as any).fromTextArea(editorId, {
        mode:
          language === "cpp"
            ? "text/x-c++src"
            : language === "c"
              ? "text/x-csrc"
              : "text/x-python",
        theme: "idea",
        tabSize: 2,
        tabindex: 2,
        indentWithTabs: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      // Get initial code from localstorage if it exist or use the default stub code 

      const tempLang = localStorage.getItem("language") || language;
      const tempStub =
        JSON.parse(localStorage.getItem(`${location}-${tempLang}-code`) as string) ||
        stub[tempLang];

      EditorRef.current?.getDoc().setValue(tempStub);
    };

    if (!EditorRef.current) init();
    else {
      // Handle codemirror code change

      EditorRef.current?.on("change", (instance: EditorFromTextArea, changes: any) => {
        const code = instance.getValue();
        if (changes.origin !== "setValue") {
          dispatch(setCurrentCode(code));
          const tempLang = localStorage.getItem('language') || 'cpp';
          localStorage.setItem(`${location}-${tempLang}-code`, JSON.stringify(code));
        }
      });
    }
  }, [language, stubs, dispatch, location]);

  return (
    <>
      <div>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            localStorage.setItem("language", e.target.value);
            const curStub =
              JSON.parse(
                localStorage.getItem(`${location}-${e.target.value}-code`) as string
              ) || stubs[e.target.value];

            EditorRef.current?.getDoc().setValue(curStub);
            dispatch(setCurrentLang(e.target.value));
            dispatch(setCurrentCode(curStub));
          }}
          className="p-2 text-xs pr-4 rounded-md font-bold bg-transparent border border-gray-300"
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
          <option value="c">C</option>
        </select>
      </div>
      <textarea className="" id="realtimeEditor"></textarea>
    </>
  );
}