import { useState, useEffect } from "react";
import Editor from "../components/Editor";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { asyncSingleProblemGet } from "../store/ProblemSlice";
import { RootState } from "../store/store";
import { TestcaseType } from "../utils/type";
import MarkdownEditor from "@uiw/react-markdown-editor";
import toast from "react-hot-toast";
import { asyncProgrammemRun } from "../store/CodeSlice";
import { useGetProblemStatusQuery } from "../store/services/ProblemStatus";
import { Loading } from '@nextui-org/react';


function ProblemPage() {
    const [bottomDrawer, setBottomDrawer] = useState("input");
    const [verdict, setVerdict] = useState("");
    const [status, setStatus] = useState("in queue");
    const [output, setOutput] = useState("");
    const dispatch = useDispatch();
    const problem = useSelector(
        (state: RootState) => state.problem.singleProblem
    );
    const location = useLocation().pathname.split("/")[2];
    const [sampleTestcase, setSampleTestcase] = useState<TestcaseType[]>([]);
    const currentCode = useSelector((state: RootState) => state.code.currentCode);
    const currentLang = useSelector((state: RootState) => state.code.currentLang);
    const JobId = useSelector((state: RootState) => state.code.jobId);
    const [skip, setSkip] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [jobId, setJobId] = useState("");

    useEffect(() => {
        setJobId(JobId)
    }, [JobId])

    // Status polling
    const problemData = useGetProblemStatusQuery(
        jobId,
        !!jobId && !skip ? { pollingInterval: 1000 } : { skip: true }
    );

    useEffect(() => {
        const { data } = problemData;
        if (data) {
            if (data.job.status !== "in queue") {
                setSkip(true);
                setStatus(data.job.status);
                setOutput(data.job.output);
                console.log(data.job)
            }
        }
        console.log(problemData.data)
    }, [problemData.data]);

    useEffect(() => {
        if (problem?.testcase) {
            const temp = problem?.testcase.filter((item) => item.sample === true);
            setSampleTestcase(temp);
        }
    }, [problem?.testcase]);

    useEffect(() => {
        dispatch(asyncSingleProblemGet(location) as any);
    }, []);

    const handleRun = async () => {
        setSkip(false);
        setBottomDrawer("output");
        setOutput("")
        setStatus('in queue')
        dispatch(asyncProgrammemRun({ currentCode, currentLang, userInput }) as any);
    };


    return (
        <div className="flex">
            <div className="flex-grow h-screen overflow-y-auto sc1 problemPage p-2 px-5">
                <h1 className="text-3xl py-3 border-b capitalize mb-8 text-center">
                    {problem?.title}
                </h1>
                <MarkdownEditor.Markdown source={problem?.statement} />
                {problem?.input && (
                    <div className="my-6">
                        <h2 className="text-lg mb-2">Input Format</h2>
                        <MarkdownEditor.Markdown source={problem?.input} />
                    </div>
                )}
                {problem?.output && (
                    <div className="my-6">
                        <h2 className="text-lg mb-2">Output Format</h2>
                        <MarkdownEditor.Markdown source={problem?.output} />
                    </div>
                )}
                {problem?.constraints && (
                    <div className="my-6">
                        <h2 className="text-lg mb-2">Constraints</h2>
                        <MarkdownEditor.Markdown source={problem?.constraints} />
                    </div>
                )}
                {sampleTestcase &&
                    sampleTestcase.map((item, index) => (
                        <div key={index}>
                            <div className="my-6">
                                <h2 className="text-lg mb-2">Sample Input {index + 1}</h2>
                                <p className="whitespace-pre-wrap bg-slate-300 p-4 rounded font-mono text-lg relative">
                                    {item.input}
                                    <button className="absolute top-0 right-0 font-mono text-xs bg-black text-white p-1 px-2 rounded hover:text-black hover:bg-white font-bold">
                                        COPY
                                    </button>
                                </p>
                            </div>
                            <div className="my-6">
                                <h2 className="text-lg mb-2">Sample Output {index + 1}</h2>
                                <p className="whitespace-pre-wrap bg-slate-300 p-4 rounded font-mono text-lg">
                                    {item.output}
                                </p>
                            </div>
                            {item.explanation && (
                                <div className="my-6">
                                    <h2 className="text-lg mb-2">Explanation</h2>
                                    <MarkdownEditor.Markdown source={item.explanation} />
                                </div>
                            )}
                        </div>
                    ))}
            </div>
            <div className="min-w-[45%] border problemPage border-r-0 pr-0 pb-0 p-3 flex flex-col overflow-hidden">
                <div className="">
                    <Editor />
                </div>
                <div className="bg-gray-100 text-sm text-gray-700 space-x-4 p-2">
                    <button
                        className={`${bottomDrawer === "input" && "bg-white shadow"
                            } p-2 px-4 rounded-md`}
                        onClick={() => setBottomDrawer("input")}
                    >
                        Custom Input
                    </button>
                    <button
                        className={`${bottomDrawer === "output" && "bg-white shadow"
                            } p-2 px-4 rounded-md`}
                        disabled={!output}
                        onClick={() => setBottomDrawer("output")}
                    >
                        Output
                    </button>
                    <button
                        className={`${bottomDrawer === "result" && "bg-white shadow"
                            } p-2 px-4 rounded-md`}
                        onClick={() => setBottomDrawer("result")}
                    >
                        Code Result
                    </button>
                </div>
                <div className="bg-gray-100 flex-grow flex flex-col items-end p-4 pt-2 min-h-[125px]">
                    {bottomDrawer === "input" ? (
                        <textarea
                            className="bg-white flex-grow w-full border outline-none p-2 text-sm font-bold rounded-sm shadow"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                        ></textarea>
                    ) : bottomDrawer === "result" ? (
                        <div
                            className={`bg-white flex-grow w-full border ${verdict === "ac"
                                ? "border-green-600"
                                : verdict === "wa"
                                    ? "border-red-600"
                                    : verdict === "tle"
                                        ? "border-red-800"
                                        : "border-slate-700"
                                } outline-none p-2 text-xl grid place-items-center font-bold rounded-sm shadow`}
                        >
                            {verdict === "ac" && (
                                <span className="text-green-600">ACCPETED</span>
                            )}
                            {verdict === "wa" && (
                                <span className="text-red-600">WRONG ANSWER</span>
                            )}
                            {verdict === "tle" && (
                                <span className="text-red-800">TIME LIMIT EXCEEDED</span>
                            )}
                            {verdict === "" && (
                                <span className="text-slate-800">SUBMIT YOUR CODE FIRST.</span>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white rounded shadow">
                            {status === "in queue" ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <Loading size="xl" type="points-opacity" />
                                    <span className="font-mono mt-2 font-bold text-blue-600">
                                        Submission is in queue...
                                    </span>
                                </div>
                            ) : (
                                <textarea
                                    className="font-mono text-sm p-2 h-full w-full px-4 outline-none textarea"
                                    value={output}
                                    readOnly
                                ></textarea>
                            )}
                        </div>
                    )}
                    <div className="space-x-4 text-sm mt-3">
                        <button className="p-2 shadow-md  px-8 border bg-white rounded-lg" onClick={handleRun}>
                            Run
                        </button>
                        <button className="p-2 shadow-md font-semibold px-8 border bg-slate-600 text-white rounded-lg">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemPage;