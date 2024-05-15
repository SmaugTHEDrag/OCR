import img from "../imgs/img";
import { useState, useEffect } from "react";

function Process() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imgurl, setImgUrl] = useState(null);
    const [ocrvalue, setocrvalue] = useState("");
    const [ocrjson, setocrjson] = useState("");
    const [processing, setProcessing] = useState(false);
    const [myJsonData, setMyJsonData] = useState(null);
    const [switchtype, setswitchtype] = useState("json");
    const [modifydata, setmodifydata] = useState("");
    const [currentkey, setcurrentkey] = useState("");
    const [error, seterror] = useState("");
    const [inputservice, setinputservice] = useState("");
    const [Arrayoftext,setArrayoftext] = useState([]);
    const [convertprocess,setconvertprocess] = useState(false);
    const [arrayofvalue,setarrayofvalue] = useState("");
    const [modifydata2,setmodifydata2] = useState("");
    const [currentvalue,setcurrentvalue] = useState("");


    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];

    const isFileExtensionAllowed = (filename) => {
        const fileExtension = filename.split('.').pop().toLowerCase();
        return allowedExtensions.includes(fileExtension);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file.name);
            setImgUrl(URL.createObjectURL(file));
        }
    };

    const convertOJson = async (rawtext) => {
        // console.log(`attepming convertojson`);
        // console.log(`rawtext: `,rawtext)
        try {
            setconvertprocess(true);
            const response = await fetch(`https://fastapi-r12h.onrender.com/convert?raw_text=${rawtext}`, {
                method: 'POST',
                body:"",
            });
            if (!response.ok) {
                throw new Error('Network response was not ok at convert');
            }
            const json = await response.json();
            // console.log(`json : ${JSON.stringify(json)}`);
            setocrjson(json.reply);
            setconvertprocess(false);
        } catch (err) {
            setconvertprocess(false);
            seterror(err.message);
        }
    };

    const sendFiles = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (!inputservice) {
                throw new Error("Please select a service");
            }
            const formData = new FormData();
            const myFiles = document.getElementById('myFiles').files;

            for (let i = 0; i < myFiles.length; i++) {
                const file = myFiles[i];
                const isAllowed = isFileExtensionAllowed(file.name);
                if (!isAllowed) {
                    throw new Error("We only allow file PDF,TIFF,JPEG and PNG.");
                }
                formData.append('file', file);
            }
            if (myFiles.length <= 0) {
                throw new Error("Please select a file");
            }
            const response = await fetch(`https://fastapi-r12h.onrender.com/text-extraction?service=${inputservice}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok at sending file');
            }

            const json = await response.json();
            setocrvalue(json);
            setProcessing(false);
            seterror("");
        } catch (err) {
            setProcessing(false);
            seterror(err.message);
        }
    };

    useEffect(() => {
        if (ocrvalue) {
            // console.log(`ocrvalue.raw_text : ${ocrvalue.raw_text}`);
            convertOJson(ocrvalue.raw_text);
        }
    }, [ocrvalue]);

    const extractKeys = (obj, keys = []) => {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                extractKeys(obj[key], keys);
            } else {
                keys.push(key);
            }
        }
        return keys;
    };
    const extractvalues = (obj,values = [] ) => {
        for(let key in obj){
            if(typeof obj[key] === "object" && obj[key] !== null){
                extractvalues(obj[key],values);
            }else{
                values.push(obj[key]);
            }
        }
        return values;
    }

    useEffect(() => {
        if (ocrjson) {
            // console.log(`ocrjson : ${JSON.stringify(ocrjson)}`)
            const jsonString = ocrjson.replace(/```/g, '').trim(); // Remove the triple backticks
            const parsedData = JSON.parse(jsonString);
            // console.log("parsedData :", parsedData);
            setMyJsonData(parsedData);
            const keys = extractKeys(parsedData);
            setArrayoftext(keys);
            // console.log("array of text", keys);
        }
    }, [ocrjson]);

    useEffect(() =>{
        const keys = extractKeys(myJsonData);
        const values = extractvalues(myJsonData);
        setArrayoftext(keys);
        setarrayofvalue(values)
        // console.log("array of text", keys);
    },[myJsonData])


    const modifyKey = (obj, currentKey, newKey) => {
        if (typeof obj !== 'object' || obj === null) return obj;
    
        const newObj = {};
        for (let key in obj) {
            if (key === currentKey) {
                newObj[newKey] = obj[key];
            } else {
                newObj[key] = modifyKey(obj[key], currentKey, newKey);
            }
        }
        return newObj;
    };
    const modifyvalue = (obj,currentvalue,newvalue) => {
        if (typeof obj !== 'object' || obj === null) return obj;
    
        const newObj = {};
        for (let key in obj) {
            if (obj[key] === currentvalue) {
                newObj[key] = newvalue;
            } else {
                newObj[key] = modifyvalue(obj[key], currentvalue, newvalue);
            }
        }
        return newObj;
    }
    

    const modifyfunction = (e) => {
        e.preventDefault();
        if (!modifydata) {
            console.log(`no modifydata is found`);
        } else {
            const updatedData = modifyKey({ ...myJsonData }, currentkey, modifydata);
            setMyJsonData(updatedData);
            setmodifydata("");
            setcurrentkey("");
        }
    };
    const modifyfunction2 = (e) => {
        e.preventDefault();
        if (!modifydata2) {
            console.log(`no modifydata is found`);
        } else {
            const updatedData = modifyvalue({ ...myJsonData }, currentvalue, modifydata2);
            setMyJsonData(updatedData);
            setmodifydata2("");
            setcurrentvalue("");
        }
    };

    return (
        <div className="bg-gray-900 font-mono">
            <div className='md:m-auto flex flex-col flex-wrap text-wrap pb-24 border-4' style={{ maxWidth: "1450px" }}>
                <div className="flex justify-center flex-wrap w-auto h-auto">
                    <div className="flex flex-col items-center mt-9">
                        <h1 className="md:text-5xl text-2xl text-white">See Yourself</h1>
                        <h1 className="break-words text-center mt-2 text-white md:text-lg text-sm" style={{ maxWidth: "52rem" }}>Choose from invoices, account & credit card statements, trade register excerpts, payroll statements, identification document and convince yourself.</h1>
                    </div>
                </div>
                <div className="flex gap-10 mt-12 flex-wrap justify-center border-2 border-yellow-200">
                    {
                        imgurl ? (
                            <div className="flex flex-col items-center">
                                <img className="object-contain h-fit md:max-w-28" src={imgurl} alt="" />
                                <h1 className="text-3xl text-yellow-400 mt-3">{selectedFile}</h1>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center md:max-w-28 overflow-auto text-green-500 border-4 text-4xl p-4 h-28" style={{ whiteSpace: 'pre-wrap' }}>
                                Your file input
                            </div>
                        )
                    }
                    {
                        ocrvalue ? (
                            <div className="md:max-w-28 overflow-auto border-none text-green-500 max-h-34 border-4 whitespace-pre-line">
                                {ocrvalue.raw_text}
                            </div>
                        ) : (
                            processing ? (
                                <div className="flex flex-col justify-center items-center md:max-w-28 overflow-auto text-blue-400 border-4 text-lg p-4 h-28 text-wrap" style={{ whiteSpace: 'pre-wrap' }}>
                                    <div>This could take a minute, please wait...</div>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center md:max-w-28 overflow-auto text-green-500 border-4 text-4xl p-4 h-28" style={{ whiteSpace: 'pre-wrap' }}>
                                    <div>YOUR RESULT</div>
                                </div>
                            )
                        )
                    }
                    <div className="flex flex-col items-center">
                        <label htmlFor="myFiles" className="hover:cursor-pointer border-dashed border-4 border-yellow-400 flex flex-col justify-center items-center w-auto md:p-6 p-10">
                            <input
                                type="file"
                                id="myFiles"
                                accept="*/*"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <>
                                <img className="mt-7 md:max-h-15 md:h-auto h-32" src={img.fileupload} alt="" />
                                <h1 className="text-3xl text-yellow-400 mt-3">Click here</h1>
                                <h1 className="text-2xl mt-3 text-white mb-7">PDF, TIFF, JPEG & PNG</h1>
                            </>
                        </label>
                        <select className="mt-2 p-2 text-md border-none rounded-md hover:cursor-pointer" onChange={(e) => setinputservice(e.target.value)}>
                            <option value="">Select OCR services</option>
                            <option value="Veryfi">Veryfi (recommend)</option>
                            <option value="Google lens">Google lens</option>
                            <option value="Google vision">Google vision</option>
                        </select>
                        <button className={!processing ? "text-white mt-4 text-md p-2 rounded-md w-52 bg-yellow-400 hover:bg-yellow-200" : "text-white mt-6 text-md p-2 rounded-md w-52 bg-yellow-500 opacity-50 cursor-not-allowed"} disabled={processing} onClick={sendFiles}> {processing ? "PROCESSING....." : "START OCR"}</button>
                        {
                            error ? (
                                <div className="text-red-700 mt-2 text-xl">{error}</div>
                            ) : null
                        }
                    </div>
                </div>
                <div className="flex justify-center items-center p-10 flex-wrap border-4 border-blue-400 text-white">
                    <div className={switchtype !== "json" ? "border-4 border-gray-300 p-10 flex flex-col items-center gap-4 rounded-lg" : "border-4 border-green-500 p-10 flex flex-col items-center gap-4 rounded-lg"}>
                        <h1 className="mb-2 text-3xl text-yellow-400">Default Template</h1>
                        <div className="flex border-2">
                            <div className="border-2 p-5 text-center hover:cursor-pointer hover:bg-green-600" onClick={() => setswitchtype("json")}> .JSON </div>
                            <div className="border-2 p-5 text-center hover:cursor-pointer hover:bg-gray-300" onClick={() => setswitchtype("text")}> Text </div>
                        </div>
                        {
                            convertprocess ? (
                                <>
                                    <div className="flex flex-col justify-center items-center md:max-w-28 overflow-auto text-blue-400 border-4 text-lg p-4 h-28 text-wrap" style={{ whiteSpace: 'pre-wrap' }}>
                                        <div>CONVERTING......</div>
                                    </div>
                                </>
                            ) :(
                                <>
                                    {
                                        switchtype === "json" && myJsonData ? (
                                            <div className="text-green-500">
                                                <pre>{JSON.stringify(myJsonData, null, 3)}</pre>
                                            </div>
                                        ) : switchtype === "text" && myJsonData ? (
                                            <div className="text-gray-300 overflow-auto">
                                                {
                                                    modifydata || modifydata2 ? (
                                                        <>
                                                            <form onSubmit={modifyfunction} className="mb-6">
                                                                <h1>Modify key ({modifydata})</h1>
                                                                <input type="text" value={modifydata} onChange={(e) => setmodifydata(e.target.value)} className="text-red-600 mr-2" />
                                                                <button type="submit">CHANGE</button>
                                                            </form>
                                                            <form onSubmit={modifyfunction2} className="mb-6">
                                                                <h1>Modify value ({modifydata2})</h1>
                                                                <input type="text" value={modifydata2} onChange={(e) => setmodifydata2(e.target.value)} className="text-red-600 mr-2" />
                                                                <button type="submit">CHANGE</button>
                                                            </form>                                                   
                                                        </>
                                                    ) : (
                                                        <div className="text-center mb-4 text-wrap">Click any field you want to modify in this template</div>
                                                    )
                                                }
                                                <div className="flex flex-wrap gap-2">
                                                    <div>
                                                        {  
                                                            Object.entries(Arrayoftext).map(([key, value]) => (
                                                                <div key={key} className="hover:cursor-pointer border-2 p-2" onClick={() => { setmodifydata(value); setcurrentkey(value); }}>
                                                                    {key}.{value}
                                                                </div>
                                                            ))
                                                            // <>
                                                            //     <div>convert to text template</div>
                                                            // </>
                                                        }
                                                    </div>
                                                    <div>
                                                        {  
                                                            Object.entries(arrayofvalue).map(([key, value]) => (
                                                                <div key={key} className="hover:cursor-pointer border-2 p-2" onClick={() => { setmodifydata2(value); setcurrentvalue(value); }}>
                                                                    {value}
                                                                </div>
                                                            ))
                                                            // <>
                                                            //     <div>convert to text template</div>
                                                            // </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null
                                    }
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Process;
