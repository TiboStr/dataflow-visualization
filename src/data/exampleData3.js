import {MarkerType} from "react-flow-renderer";

export const nodesData = [
    {id: 'RDF', type: "custom", data: {label: 'RDF', shape: "cylinder"}, position: {x: 0, y: -30},},
    {id: "RDF'", type: "custom", data: {label: "RDF'", shape: "cylinder"}, position: {x: 0, y: 30},},
    {id: "RDF''", type: "custom", data: {label: "RDF''", shape: "cylinder"}, position: {x: 0, y: 90},},
    {id: "RDF'''", type: "custom", data: {label: "RDF'''", shape: "cylinder"}, position: {x: 0, y: 150},},
    {id: "RDF''''", type: "custom", data: {label: "RDF''''", shape: "cylinder"}, position: {x: 0, y: 210},},


    {id: 'comunica', type: 'custom', data: {label: '', shape: "comunica"}, position: {x: 600, y: 90},},
    {id: "SPARQL", type: "custom", data: {label: "SPARQL", shape: "note"}, position: {x: 600, y: 180}},


    {
        id: "note1",
        type: "custom",
        data: {
            label: "Comunica queries\nmultiple RDF\ndatasets\nSPARQL sub-query\ngoes in, results\ncome out",
            width: 120,
            height: 120,
            shape: "note"
        },
        position: {x: 500, y: -10}
    },

];


export const edgesData = [
    {
        id: "RDF to comunica",
        source: 'RDF',
        target: 'comunica',
        type: 'straight',
        markerStart: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse"
        },
        style: {strokeDasharray: "5 2 2 2", animationDirection: "reverse"},
        animated: true
    },
    {
        id: "RDF' to comunica",
        source: "RDF'",
        target: 'comunica',
        type: 'straight',
        markerStart: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse"
        },
        style: {strokeDasharray: "5 2 2 2", animationDirection: "reverse"},
        animated: true
    },
    {
        id: "RDF'' to comunica",
        source: "RDF''",
        target: 'comunica',
        type: 'straight',
        markerStart: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse"
        },
        style: {strokeDasharray: "5 2 2 2", animationDirection: "reverse"},
        animated: true
    },
    {
        id: "RDF''' to comunica",
        source: "RDF'''",
        target: 'comunica',
        type: 'straight',
        markerStart: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse"
        },
        style: {strokeDasharray: "5 2 2 2", animationDirection: "reverse"},
        animated: true
    },
    {
        id: "RDF'''' to comunica",
        source: "RDF''''",
        target: 'comunica',
        type: 'straight',
        markerStart: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse"
        },
        style: {
            strokeDasharray: "5 2 2 2",
            animationDirection: "reverse"
            // animation: "dashdraw .10s linear infinite alternate",
            //animationDirection: "alternate"

        },
        animated: true
    },
    {
        id: "comunica to SPARQL",
        source: "comunica",
        target: "SPARQL",
        type: "straight",
        sourceHandle: "bottom-source",
        targetHandle: "top-target",
        style: {
            strokeDasharray: 3,
            animationDirection: "reverse"
        },
        animated: true
    }
];
