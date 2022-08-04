import Editor from "@monaco-editor/react";
import {Button, Modal} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import dagre from "dagre";
import YAML from "js-yaml";
import {useRef, useState} from "react";

import {
    edgesJSON as edgesJSON1,
    globalDefaultsJSON as globalDefaultsJSON1,
    nodesJSON as nodesJSON1
} from "../../data/exampleData1";
import {
    edgesJSON as edgesJSON2,
    globalDefaultsJSON as globalDefaultsJSON2,
    nodesJSON as nodesJSON2
} from "../../data/exampleData2";
import {
    edgesJSON as edgesJSON3,
    globalDefaultsJSON as globalDefaultsJSON3,
    nodesJSON as nodesJSON3
} from "../../data/exampleData3";
import {
    edgesJSON as edgesJSON4,
    globalDefaultsJSON as globalDefaultsJSON4,
    nodesJSON as nodesJSON4
} from "../../data/exampleData4";
import {
    edgesJSON as edgesJSON5,
    globalDefaultsJSON as globalDefaultsJSON5,
    nodesJSON as nodesJSON5
} from "../../data/exampleData5";
import {
    edgesJSON as edgesJSON6,
    globalDefaultsJSON as globalDefaultsJSON6,
    nodesJSON as nodesJSON6
} from "../../data/exampleData6";


import {parseEdges, parseGlobalDefaults, parseNodes} from "./editorUtil";
import {getLayoutedElementsDagre} from "./editorUtilPositioning";
import {edgeSchema, globalDefaultSchema, nodeSchema, validateJSON} from "./schemaValidation";


const EditorArea = ({setNodes, setEdges}) => {

    const monacoRefGlobalDefault = useRef(null);
    const monacoRefNodes = useRef(null);
    const monacoRefEdges = useRef(null);


    const [globalDefaults, setGlobalDefaults] = useState(JSON.stringify({}));
    const [nodesData, setNodesData] = useState(JSON.stringify([]));
    const [edgesData, setEdgesData] = useState(JSON.stringify([]));

    const [language, setLanguage] = useState("json");

    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessageTitle, setErrorMessageTitle] = useState("");
    const [errorMessages, setErrorMessages] = useState([]);


    const examples = [
        [globalDefaultsJSON1, nodesJSON1, edgesJSON1], [globalDefaultsJSON2, nodesJSON2, edgesJSON2],
        [globalDefaultsJSON3, nodesJSON3, edgesJSON3], [globalDefaultsJSON4, nodesJSON4, edgesJSON4],
        [globalDefaultsJSON5, nodesJSON5, edgesJSON5], [globalDefaultsJSON6, nodesJSON6, edgesJSON6],
    ];

    function handleErrorPopUpClose() {
        setErrorMessageTitle("")
        setErrorMessages([])
        setErrorModalVisible(false)
    }

    function json2yaml(jsonData) {
        let yamlValue;
        try {
            yamlValue = YAML.dump(JSON.parse(jsonData));
            return yamlValue;
        } catch (e) {
            return e;
        }
    }

    function yaml2json(yamlData) {

        let jsonValue;
        try {
            jsonValue = JSON.stringify(YAML.load(yamlData.toString()), null, "\t");
            return jsonValue;
        } catch (e) {
            return e;
        }
    }


    function loadExample(e, number) {
        e.preventDefault();

        let example = examples[number - 1];

        let defaults = JSON.stringify(example[0], null, "\t");
        let nodes = JSON.stringify(example[1], null, "\t");
        let edges = JSON.stringify(example[2], null, "\t");

        if (language === "yaml") {
            defaults = json2yaml(defaults);
            nodes = json2yaml(nodes);
            edges = json2yaml(edges);
        }

        setGlobalDefaults(defaults);
        setNodesData(nodes);
        setEdgesData(edges);
    }

    function changeLanguage(e) {

        let newLang = e;

        if (newLang === "yaml" && language === "json") {
            setGlobalDefaults(json2yaml(globalDefaults));
            setNodesData(json2yaml(nodesData));
            setEdgesData(json2yaml(edgesData));
            setLanguage(e);
        } else if (newLang === "json" && language === "yaml") {
            setGlobalDefaults(yaml2json(globalDefaults));
            setNodesData(yaml2json(nodesData));
            setEdgesData(yaml2json(edgesData));
            setLanguage(e);
        }

    }


// Convert what's inside the editors to a graph
    function handleConvert(e) {
        e.preventDefault();

        let gd = globalDefaults;
        let nd = nodesData;
        let ed = edgesData;

        if (language === "yaml") {
            gd = yaml2json(globalDefaults);
            nd = yaml2json(nodesData);
            ed = yaml2json(edgesData);
        }


        const parsedGd = JSON.parse(gd);
        const parsedNd = JSON.parse(nd);
        const parsedEd = JSON.parse(ed);

        let error = false;

        function setError(e) {
            setErrorMessages(e);
            error = true;
            setErrorModalVisible(true);
        }


        setErrorMessageTitle("Error while validating global defaults");
        validateJSON(parsedGd, globalDefaultSchema, setError /*setError*/);
        if (error) {
            return;
        }

        setErrorMessageTitle("Error while validating nodes");
        validateJSON(parsedNd, nodeSchema, setError)
        if (error) {
            setErrorModalVisible(true);
            return;
        }

        setErrorMessageTitle("Error while validating edges");
        validateJSON(parsedEd, edgeSchema, setError);
        if (error) {
            setErrorModalVisible(true);
            return;
        }

        // TODO: ookal is syntaxis alles juist, ook nog eens checken op de semantische correctheid
        //  bv als naar een id verwezen wordt, bestaat die ID wel


        let defaults = parseGlobalDefaults(parsedGd);
        let nodes = parseNodes(defaults, parsedNd);
        let edges = parseEdges(defaults, parsedEd, nodes);


        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        if (defaults["autoLayout"]) {
            [nodes, edges] = getLayoutedElementsDagre(dagreGraph, nodes, edges, defaults);
        }

        setNodes(nodes);
        setEdges(edges);

    }


   function handleEditorWillMountGlobalDefault(monaco) {


   }

    function handleEditorDidMountGlobalDefault(editor, monaco) {
        // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-configure-json-defaults

        monacoRefGlobalDefault.current = editor;

        const modelUri = monaco.Uri.parse('a://b/foo.json'); // a made up unique URI for our model
        const model = monaco.editor.createModel("{   }", 'json', modelUri);


        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
                {

                    fileMatch: [modelUri.toString()],
                    schema: {

                        "type": "object",
                        "properties": {
                            "animated": {
                                "type": "boolean"
                            },
                            "animation": {
                                "type": "string"
                            },
                            "type": {
                                "type": "string",
                                "enum": [
                                    "default",
                                    "step",
                                    "smoothstep",
                                    "straight"
                                ]
                            },
                            "edgeColor": {
                                "type": "string"
                            },
                            "edgeThickness": {
                                "type": "number"
                            },
                            "strokeDasharray": {
                                "type": [
                                    "number",
                                    "string"
                                ]
                            },
                            "fill": {
                                "type": "string"
                            },
                            "fontsize": {
                                "type": "number"
                            },
                            "shape": {
                                "type": "string",
                                "enum": [
                                    "8-star",
                                    "big-star",
                                    "circle",
                                    "cylinder",
                                    "diamond",
                                    "hexagon",
                                    "note",
                                    "rectangle",
                                    "square",
                                    "star",
                                    "triangle",
                                    "comunica",
                                    "rmlio",
                                    "solid"
                                ]
                            },
                            "stroke": {
                                "type": "string"
                            },
                            "strokeWidth": {
                                "type": "number"
                            },
                            "height": {
                                "type": "number"
                            },
                            "width": {},
                            "autoLayout": {
                                "type": "boolean"
                            },
                            "orientation": {
                                "type": "string",
                                "enum": [
                                    "vertical",
                                    "horizontal"
                                ]
                            },
                            "markerStart": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "arrow",
                                            "arrowclosed"
                                        ],
                                        "errorMessage": "Type of arrow must be string with possible values: arrow  or arrowclosed"
                                    },
                                    "orient": {
                                        "type": [
                                            "string",
                                            "number"
                                        ],
                                        "errorMessage": "Orient of arrow must be number or string"
                                    },
                                    "color": {
                                        "type": "string",
                                        "errorMessage": "Color of arrow must be string"
                                    }
                                }
                            },
                            "markerEnd": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "arrow",
                                            "arrowclosed"
                                        ],
                                        "errorMessage": "Type of arrow must be string with possible values: arrow  or arrowclosed"
                                    },
                                    "orient": {
                                        "type": [
                                            "string",
                                            "number"
                                        ],
                                        "errorMessage": "Orient of arrow must be number or string"
                                    },
                                    "color": {
                                        "type": "string",
                                        "errorMessage": "Color of arrow must be string"
                                    }
                                }
                            }
                        },
                        "errorMessage": {
                            "properties": {
                                "animated": "animated must be boolean",
                                "animation": "animation must be string",
                                "type": "type must be string with possible values: default , step , smoothstep  or straight",
                                "edgeColor": "edgeColor must be string",
                                "edgeThickness": "edgeThickness must be number",
                                "strokeDasharray": "strokeDasharray must be number or string",
                                "fill": "fill must be string",
                                "fontsize": "fontsize must be number",
                                "shape": "shape must be string with possible values: 8-star , big-star , circle , cylinder , diamond , hexagon , note , rectangle , square , star , triangle , comunica , rmlio  or solid",
                                "stroke": "stroke must be string",
                                "strokeWidth": "strokeWidth must be number",
                                "height": "height must be number",
                                "width": "width must be ",
                                "autoLayout": "autoLayout must be boolean",
                                "orientation": "orientation must be string with possible values: vertical  or horizontal"
                            },
                            "type": "Global settings are expected to be initialized in an object"
                        }
                    }
                }
            ]
        })


       /* monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
                {
                    uri: 'http://myserver/foo-schema.json', // id of the first schema
                    fileMatch: [modelUri.toString()], // associate with our model
                    schema: {
                        type: 'object',
                        properties: {
                            p1: {
                                enum: ['v1', 'v2']
                            },
                            p2: {
                                $ref: 'http://myserver/bar-schema.json' // reference the second schema
                            }
                        }
                    }
                },
                {
                    uri: 'http://myserver/bar-schema.json', // id of the second schema
                    schema: {
                        type: 'object',
                        properties: {
                            q1: {
                                enum: ['x1', 'x2']
                            }
                        }
                    }
                }
            ]
        });*/


        editor.setModel(model)



    }

    function editorDidMountNodes(editor, monaco) {
        monacoRefNodes.current = editor;

        const modelUri = monaco.Uri.parse('a://b/nodes.json'); // a made up unique URI for our model
        const model = monaco.editor.createModel("{   }", 'json', modelUri);


        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
                {
                    uri: 'http://myserver/foo-schema.json', // id of the first schema
                    fileMatch: [modelUri.toString()], // associate with our model
                    schema: {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "id must be string"
                                    }
                                },
                                "zIndex": {
                                    "type": "number",
                                    "errorMessage": {
                                        "type": "zIndex must be number"
                                    }
                                },
                                "image": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "image must be string"
                                    }
                                },
                                "label": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "label must be string"
                                    }
                                },
                                "title": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "title must be string"
                                    }
                                },
                                "parentNode": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "parentNode must be string"
                                    }
                                },
                                "fill": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "fill must be string"
                                    }
                                },
                                "fontsize": {
                                    "type": "number",
                                    "errorMessage": {
                                        "type": "fontsize must be number"
                                    }
                                },
                                "shape": {
                                    "type": "string",
                                    "enum": [
                                        "8-star",
                                        "big-star",
                                        "circle",
                                        "cylinder",
                                        "diamond",
                                        "hexagon",
                                        "note",
                                        "rectangle",
                                        "square",
                                        "star",
                                        "triangle",
                                        "comunica",
                                        "rmlio",
                                        "solid"
                                    ],
                                    "errorMessage": {
                                        "type": "shape must be string with possible values: 8-star , big-star , circle , cylinder , diamond , hexagon , note , rectangle , square , star , triangle , comunica , rmlio  or solid"
                                    }
                                },
                                "stroke": {
                                    "type": "string",
                                    "errorMessage": {
                                        "type": "stroke must be string"
                                    }
                                },
                                "strokeWidth": {
                                    "type": "number",
                                    "errorMessage": {
                                        "type": "strokeWidth must be number"
                                    }
                                },
                                "height": {
                                    "type": "number",
                                    "errorMessage": {
                                        "type": "height must be number"
                                    }
                                },
                                "width": {
                                    "type": "number",
                                    "errorMessage": {
                                        "type": "width must be number"
                                    }
                                },
                                "position": {
                                    "type": "object",
                                    "properties": {
                                        "x": {
                                            "type": "number",
                                            "errorMessage": "object.x must be number"
                                        },
                                        "y": {
                                            "type": [
                                                "number"
                                            ],
                                            "errorMessage": "object.y must be number"
                                        }
                                    }
                                }
                            },
                            "errorMessage": {
                                "type": "Each node should be an object",
                                "properties": {}
                            }
                        },
                        "errorMessage": {
                            "type": "Nodes are expected to be objects in an array"
                        }
                    }
                }
            ]
        });



        editor.setModel(model)
    }


    return <>

        <Modal show={errorModalVisible} onHide={handleErrorPopUpClose}
               scrollable={true}>
            <Modal.Header closeButton>
                <Modal.Title>{errorMessageTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessages.map(e => <p>{e}</p>)}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => handleErrorPopUpClose()}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>

        <div className="d-flex">
            {
                examples.map((_, i) => <Button className="primary" onClick={e => loadExample(e, i + 1)}
                                               key={i}>example {i + 1}</Button>
                )
            }
        </div>

        <Dropdown onSelect={changeLanguage}>
            <Dropdown.Toggle variant="warning" id="dropdown-basic">
                Language: {language.toUpperCase()}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item eventKey="json" active>JSON</Dropdown.Item>
                <Dropdown.Item eventKey="yaml">YAML</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>


        <div className="edit-area" id="global-default-editor">
            <div className="code-editor resizable" style={{height: "200px"}}>
                <h5>Global defaults editor</h5>
                <Editor
                    beforeMount={handleEditorWillMountGlobalDefault}
                    onMount={handleEditorDidMountGlobalDefault}
                    language={language}
                    value={globalDefaults}
                    onChange={content => setGlobalDefaults(content)}
                    theme="vs-dark"
                    style={{
                        width: "100%",
                        //height: "100%",
                        // minHeight: "250px",
                        //margin: "auto"
                    }}
                />
            </div>

            <div className="d-flex resizable code-editor"
                 style={{height: "350px"}}/*style={{width: "97%", margin: "auto"}}*/>

                <div className="node-edge-editor">
                    <h5>Node editor</h5>
                    <Editor
                        onMount={editorDidMountNodes}
                        language={language}
                        value={nodesData}
                        onChange={content => setNodesData(content)}
                        theme="vs-dark"
                        style={{
                            width: "100%",
                            // height: "100%",
                            //minHeight: "250px",
                            //margin: "auto"
                        }}
                    />
                </div>

                <div className="node-edge-editor">
                    <h5>Edge editor</h5>
                    <Editor
                        language={language}
                        value={edgesData}
                        onChange={content => setEdgesData(content)}
                        theme="vs-dark"
                        style={{
                            width: "100%",
                            //height: "100%",
                            //minHeight: "250px",
                            //margin: "auto"
                        }}
                    />


                </div>
            </div>

            <Button variant="primary" onClick={e => handleConvert(e)}>Convert</Button>

        </div>
    </>

}

export default EditorArea;
