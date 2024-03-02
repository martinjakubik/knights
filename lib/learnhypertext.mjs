const CANVAS_HEIGHT = 600;

const createButton = function (sId, sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oButton = document.createElement('button');
    oButton.id = sId;
    oButton.innerText = sLabel;

    oParent.appendChild(oButton);

    return oButton;
};

const createCanvas = function (sCanvasId, sClasses, nZindex = 0, oParent = document.body, nWidth, nHeight) {
    if (sCanvasId && (!sClasses || sClasses.length < 1)) {
        sClasses = sCanvasId;
    }

    const oCanvas = document.createElement('canvas');
    oCanvas.id = sCanvasId;
    oCanvas.classList.add(sClasses);
    oParent.appendChild(oCanvas);

    const nParentWidth = oCanvas.parentNode.clientWidth;
    const nParentHeight = oCanvas.parentNode.clientHeight;

    oCanvas.width = nWidth ? nWidth : nParentWidth;
    oCanvas.height = nHeight ? nHeight : nParentHeight;

    oCanvas.style.position = 'absolute';
    oCanvas.style.zindex = nZindex;

    return oCanvas;
};

const createCheckbox = function (sId, bValue, sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const sName = sId;

    const oInput = document.createElement('input');
    oInput.type = 'checkbox';
    oInput.id = sId;
    oInput.name = sName;
    oInput.value = bValue;
    oInput.checked = bValue === true;

    if (sLabel) {
        const oLabel = document.createElement('label');
        oLabel.for = sId;
        oLabel.innerText = sLabel;
        oParent.appendChild(oLabel);
    }

    oParent.appendChild(oInput);

    return oInput;
};

const createDiv = function (sId, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oDiv = document.createElement('div');
    oDiv.id = sId;

    oParent.appendChild(oDiv);

    return oDiv;
};

const createParagraph = function (sId, sValue, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oParagraph = document.createElement('p');
    oParagraph.id = sId;

    oParent.appendChild(oParagraph);

    if (sValue && sValue.length > 0) {
        const oText = document.createTextNode(sValue);
        oParagraph.appendChild(oText);
    }

    return oParagraph;
};

const createNumberInput = function (sId, nValue, sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oInput = document.createElement('input');
    oInput.type = 'number';
    oInput.id = sId;
    oInput.value = nValue;

    if (sLabel) {
        const oLabel = document.createElement('label');
        oLabel.for = sId;
        oLabel.innerText = sLabel;
        oParent.appendChild(oLabel);
    }

    oParent.appendChild(oInput);

    return oInput;
};

const createTextInput = function (sId, sValue, sLabel, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const oInput = document.createElement('input');
    oInput.id = sId;
    oInput.value = sValue;

    if (sLabel) {
        const oLabel = document.createElement('label');
        oLabel.for = sId;
        oLabel.innerText = sLabel;
        oParent.appendChild(oLabel);
    }

    oParent.appendChild(oInput);

    return oInput;
};

const createSlider = function (sId, sMin, sMax, nValue, sLabel, nStep, oParent) {
    if (!oParent) {
        oParent = document.body;
    }

    const sName = sId;

    const oInput = document.createElement('input');
    oInput.type = 'range';
    oInput.id = sId;
    oInput.name = sName;
    oInput.min = sMin;
    oInput.max = sMax;
    oInput.value = nValue;
    if (nStep) {
        oInput.step = nStep;
    }

    if (sLabel) {
        const oLabel = document.createElement('label');
        oLabel.for = sId;
        oLabel.innerText = sLabel;
        oParent.appendChild(oLabel);
    }

    oParent.appendChild(oInput);

    return oInput;
};

const createFileInput = function (sId, sValue, sLabel, oParent, sAccept) {
    if (!oParent) {
        oParent = document.body;
    }

    const oInput = document.createElement('input');
    oInput.type = 'file';
    oInput.id = sId;
    oInput.value = sValue;
    if (sAccept && sAccept.length > 0) {
        oInput.accept = sAccept;
    }

    if (sLabel) {
        const oLabel = document.createElement('label');
        oLabel.for = sId;
        oLabel.innerText = sLabel;
        oParent.appendChild(oLabel);
    }

    oParent.appendChild(oInput);

    return oInput;
};

const setBlockVisibility = function (bVisible) {
    let sStyle = 'position: absolute';
    sStyle += bVisible ? '; display: block' : '; display: none';
    return sStyle;
};

const getStyles = function (oElement, oPseudoElement) {
    return window.getComputedStyle(oElement, oPseudoElement);
};

export { CANVAS_HEIGHT, createButton, createCanvas, createCheckbox, createDiv, createParagraph, createNumberInput, createTextInput, createSlider, createFileInput, setBlockVisibility, getStyles };
