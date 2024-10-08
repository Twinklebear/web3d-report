async function webGL2Report(canvas) {
    let report = {"webgl2": false};

    let gl = canvas.getContext("webgl2", {
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true
    });

    // Re-try without failing if major performance caveat to see if this
    // system has that issue
    if (!gl) {
        gl = canvas.getContext("webgl2", {
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
        });

        // Ok, we really don't have WebGL2 support
        if (!gl) {
            return report;
        }
        // This system has some issues
        report["major_performance_caveat"] = true;
    } else {
        report["major_performance_caveat"] = false;
    }

    report["webgl2"] = true;
    report["extensions"] = gl.getSupportedExtensions();

    let queryValues = {
        // Vendor/Renderer info
        "RENDERER": gl.RENDERER,
        "VENDOR": gl.VENDOR,
        "VERSION": gl.VERSION,
        "SHADING_LANGUAGE_VERSION": gl.SHADING_LANGUAGE_VERSION,
        "MAX_COMBINED_TEXTURE_IMAGE_UNITS": gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
        "MAX_CUBE_MAP_TEXTURE_SIZE": gl.MAX_CUBE_MAP_TEXTURE_SIZE,
        "MAX_FRAGMENT_UNIFORM_VECTORS": gl.MAX_FRAGMENT_UNIFORM_VECTORS,
        "MAX_RENDERBUFFER_SIZE": gl.MAX_RENDERBUFFER_SIZE,
        "MAX_TEXTURE_IMAGE_UNITS": gl.MAX_TEXTURE_IMAGE_UNITS,
        "MAX_TEXTURE_SIZE": gl.MAX_TEXTURE_SIZE,
        "MAX_VARYING_VECTORS": gl.MAX_VARYING_VECTORS,
        "MAX_VERTEX_ATTRIBS": gl.MAX_VERTEX_ATTRIBS,
        "MAX_VERTEX_TEXTURE_IMAGE_UNITS": gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
        "MAX_VERTEX_UNIFORM_VECTORS": gl.MAX_VERTEX_UNIFORM_VECTORS,
        "MAX_VIEWPORT_DIMS": gl.MAX_VIEWPORT_DIMS,
        "MAX_3D_TEXTURE_SIZE": gl.MAX_3D_TEXTURE_SIZE,
        "MAX_ARRAY_TEXTURE_LAYERS": gl.MAX_ARRAY_TEXTURE_LAYERS,
        "MAX_CLIENT_WAIT_TIMEOUT_WEBGL": gl.MAX_CLIENT_WAIT_TIMEOUT_WEBGL,
        "MAX_COLOR_ATTACHMENTS": gl.MAX_COLOR_ATTACHMENTS,
        "MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS": gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS,
        "MAX_COMBINED_UNIFORM_BLOCKS": gl.MAX_COMBINED_UNIFORM_BLOCKS,
        "MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS": gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS,
        "MAX_DRAW_BUFFERS": gl.MAX_DRAW_BUFFERS,
        "MAX_ELEMENT_INDEX": gl.MAX_ELEMENT_INDEX,
        "MAX_ELEMENTS_INDICES": gl.MAX_ELEMENTS_INDICES,
        "MAX_ELEMENTS_VERTICES": gl.MAX_ELEMENTS_VERTICES,
        "MAX_FRAGMENT_INPUT_COMPONENTS": gl.MAX_FRAGMENT_INPUT_COMPONENTS,
        "MAX_FRAGMENT_UNIFORM_BLOCKS": gl.MAX_FRAGMENT_UNIFORM_BLOCKS,
        "MAX_FRAGMENT_UNIFORM_COMPONENTS": gl.MAX_FRAGMENT_UNIFORM_COMPONENTS,
        "MAX_PROGRAM_TEXEL_OFFSET": gl.MAX_PROGRAM_TEXEL_OFFSET,
        "MIN_PROGRAM_TEXEL_OFFSET": gl.MIN_PROGRAM_TEXEL_OFFSET,
        "MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS": gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS,
        "MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS": gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS,
        "MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS": gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS,
        "MAX_UNIFORM_BLOCK_SIZE": gl.MAX_UNIFORM_BLOCK_SIZE,
        "MAX_UNIFORM_BUFFER_BINDINGS": gl.MAX_UNIFORM_BUFFER_BINDINGS,
        "MAX_VARYING_COMPONENTS": gl.MAX_VARYING_COMPONENTS,
        "MAX_VERTEX_OUTPUT_COMPONENTS": gl.MAX_VERTEX_OUTPUT_COMPONENTS,
        "MAX_VERTEX_UNIFORM_BLOCKS": gl.MAX_VERTEX_UNIFORM_BLOCKS,
        "MAX_VERTEX_UNIFORM_COMPONENTS": gl.MAX_VERTEX_UNIFORM_COMPONENTS
    };

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
        queryValues["UNMASKED_VENDOR_WEBGL"] = debugInfo.UNMASKED_VENDOR_WEBGL;
        queryValues["UNMASKED_RENDERER_WEBGL"] = debugInfo.UNMASKED_RENDERER_WEBGL;
    }

    for (let i in queryValues) {
        report[i] = gl.getParameter(queryValues[i]);
    }

    return report;
}

async function webGPUReport(canvas) {
    let report = {"webgpu": false};
    if (navigator.gpu === undefined) {
        return report;
    }

    // Get a GPU device to render with
    let adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        return report;
    }
    let device = await adapter.requestDevice();
    if (!device) {
        return report;
    }


    report["webgpu"] = true;
    report["limits"] = {}
    for (let k in adapter.limits) {
        report["limits"][k] = adapter.limits[k];
    }

    report["features"] = []
    for (let f of adapter.features) {
        report["features"].push(f);
    }

    let adapterInfo = adapter.info || await adapter.requestAdapterInfo();
    report["adapter"] = {};
    for (let k in adapterInfo) {
        report["adapter"][k] = adapterInfo[k];
    }

    return report;
}

function sharedArrayBufferSupport() {
    try {
        var s = new SharedArrayBuffer(1024);
        if (s === undefined) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}

(async () => {
    // Make a canvas to get contexts on
    const canvas = document.createElement("canvas");

    // Check WebGL2
    let webgl = await webGL2Report(canvas);
    if (!webgl["webgl2"]) {
        document.getElementById("webgl2-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgl2").setAttribute("style", "display:block;");
    } else {
        document.getElementById("yes-webgl2").setAttribute("style", "display:block;");
    }
    console.log(webgl);
    console.log(JSON.stringify(webgl));

    // Check WebGPU
    let webgpu = await webGPUReport(canvas);
    if (!webgpu["webgpu"]) {
        document.getElementById("webgpu-canvas").setAttribute("style", "display:none;");
        document.getElementById("no-webgpu").setAttribute("style", "display:block;");
    } else {
        document.getElementById("yes-webgpu").setAttribute("style", "display:block;");
    }
    console.log(webgpu);
    console.log(JSON.stringify(webgpu));
    console.log(navigator.userAgent);

    report = {
        "webgpu": webgpu,
        "webgl2": webgl,
        "userAgent": navigator.userAgent,
        "SharedArrayBuffer": sharedArrayBufferSupport()
    };
    console.log(report);
})();

