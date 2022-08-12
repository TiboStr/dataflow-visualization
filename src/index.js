import React, {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';


import {edgeSchema, globalDefaultSchema, initSchemas, nodeSchema} from "./lib/schemaValidation";

import App from "./App";

initSchemas();   // Initialize JSON validation schemas once


const download = false;

if (download) {
    function write(title, data) {

        // This code is here to autogenerate the docs. See DEVELOPMENT.md for more information.

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${title}.schema.json`;

        link.click();
    }

    write("globalDefaults", globalDefaultSchema);
    write("nodes", nodeSchema);
    write("edges", edgeSchema);
}


const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <App/>
    </StrictMode>
);
