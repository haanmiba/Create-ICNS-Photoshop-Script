const ERROR_MESSAGES = [
    '',
    'No open document.'
];

const ENDING_SCRIPT_STRING = 'Ending script.';

const FILE_NAMES = [
    'icon_512x512@2x.png',
    'icon_512x512.png',
    'icon_256x256@2x.png',
    'icon_256x256.png',
    'icon_128x128@2x.png',
    'icon_128x128.png',
    'icon_32x32@2x.png',
    'icon_32x32.png',
    'icon_16x16@2x.png',
    'icon_16x16.png',
];

const ICON_DIMENSIONS = [
    1024,
    512,
    512,
    256,
    256,
    128,
    64,
    32,
    32,
    16,
];

const HIGH_QUALITY_PIXELS_WIDTH_HEIGHT = 1024;
const PIXELS = "px";

/**
 * Main method for creating an ICNS file from an open Adobe Photoshop document.
 */
function main() {
    checkIfThereIsADocumentOpen();

    changeRulerUnitsToPixels();

	var documentWidth = getActiveDocumentWidth();
    var documentHeight = getActiveDocumentHeight();

    evaluateDocumentWidthAndHeight(documentWidth, documentHeight);

    var iconsetFolderPath = createIconsetFolderPathFromActiveDocument();
    createIconsetFolder(iconsetFolderPath);
    exportIconsetPNGsToIconsetFolder(iconsetFolderPath);

    var escapedIconsetFolderPath = createEscapedIconsetFolderPath(iconsetFolderPath);
    convertIconsetFolderToICNS(escapedIconsetFolderPath);
    deleteIconsetFolder(escapedIconsetFolderPath)
}

/**
 * Check to see if there is a document open in Adobe Photoshop. If there is none, exit the program.
 */
function checkIfThereIsADocumentOpen() {
    if (noOpenDocuments()) {
        exit(1);
    }
}

/**
 * Checks if the number of open documents is 0.
 * @returns {boolean} TRUE if the number of open documents is 0. FALSE otherwise.
 */
function noOpenDocuments() {
    return app.documents.length === 0;   
}

/**
 * Changes the Adobe Photoshop's ruler units to pixels.
 */
function changeRulerUnitsToPixels() {
	app.preferences.rulerUnits = Units.PIXELS;
}

/**
 * Gets the active document's width.
 * @returns {number} the active document's width
 */
function getActiveDocumentWidth() {
    return app.activeDocument.width;
}

/**
 * Gets the active document's height.
 * @returns {number} the active document's height
 */
function getActiveDocumentHeight() {
    return app.activeDocument.height;
}

/**
 * Evaluates the document's height and width. If the height and width are not equal or not larger than the necessary amount of pixels to create a high quality ICNS, it will warn the user.
 * @param {number} documentWidth - the width of the document
 * @param {number} documentHeight - the height of the document
 */
function evaluateDocumentWidthAndHeight(documentWidth, documentHeight) {

    // If the document's width and height are not equal, warn the user about image distortion
    if (documentWidth != documentHeight) {
        warnUserAboutUnequalWidthAndHeight();
    }

    // If the width and/or height of the document are less than the number of pixels for a high quality ICNS, warn the user about pixelation
    if (documentWidth < HIGH_QUALITY_PIXELS_WIDTH_HEIGHT && documentHeight >= HIGH_QUALITY_PIXELS_WIDTH_HEIGHT) {
        warnUserAboutWidthBelowMaxWidth();
    } else if (documentWidth >= HIGH_QUALITY_PIXELS_WIDTH_HEIGHT && documentHeight < HIGH_QUALITY_PIXELS_WIDTH_HEIGHT) {
        warnUserAboutHeightBelowMaxHeight();
    } else if (documentWidth < HIGH_QUALITY_PIXELS_WIDTH_HEIGHT && documentHeight < HIGH_QUALITY_PIXELS_WIDTH_HEIGHT) {
        warnUserAboutWidthAndHeightBelowMaxWidth();
    }
}

/**
 * Warn the user about image distortion due to unequal document width and height.
 */
function warnUserAboutUnequalWidthAndHeight() {
    const UNEQUAL_WIDTH_HEIGHT_PROMPT = "The current document's width and height are unequal. This script may lead to some image distortion. Continue?";
    warnUser(UNEQUAL_WIDTH_HEIGHT_PROMPT);    
}

/**
 * Warn the user about image pixelation due to the document's width being below the required amount for creating a high quality ICNS.
 */
function warnUserAboutWidthBelowMaxWidth() {
    const WIDTH_BELOW_MAX_WIDTH_PROMPT = "The current document's width is below " + HIGH_QUALITY_PIXELS_WIDTH_HEIGHT + " px. Some pixelation might occur. Continue?";
    warnUser(WIDTH_BELOW_MAX_WIDTH_PROMPT);
}

/**
 * Warn the user about image pixelation due to the document's height being below the required amount for creating a high quality ICNS.
 */
function warnUserAboutHeightBelowMaxHeight() {
    const HEIGHT_BELOW_MAX_HEIGHT_PROMPT = "The current document's height is below " + HIGH_QUALITY_PIXELS_WIDTH_HEIGHT + " px. Some pixelation might occur. Continue?";
    warnUser(HEIGHT_BELOW_MAX_HEIGHT_PROMPT);
}

/**
 * Warn the user about image pixelation due to the document's height and width being below the required amount for creating a high quality ICNS.
 */
function warnUserAboutWidthAndHeightBelowMaxWidth() {
    const WIDTH_AND_HEIGHT_BELOW_MAX_HEIGHT_PROMPT = "The current document's width and height is below " + HIGH_QUALITY_PIXELS_WIDTH_HEIGHT + " px x " + HIGH_QUALITY_PIXELS_WIDTH_HEIGHT + " px. Some pixelation might occur. Continue?"
    warnUser(WIDTH_AND_HEIGHT_BELOW_MAX_HEIGHT_PROMPT);
}

/**
 * Warn the user and prompt them to continue.
 */
function warnUser(warning) {
    var userResponse = promptUserToContinue(warning);
    // If the user does not want to continue, terminate the program.
    if (userResponse == 'no') {
        exit(0);
    }
}

/**
 * Opens a dialog window prompting the user to continue with the program's execution.
 * @param {string} prompt - the prompt to display to the user to ask them to continue.
 */
function promptUserToContinue(prompt) {
    var userSelection = 'yes';

    // Create a dialog window with the prompt displayed
    var dialogWindow = new Window('dialog');
    dialogWindow.add('statictext', undefined, prompt);

    // Create the yes/no buttons, having them return 'yes' or 'no' depending on what the user selects
    var yesButton = dialogWindow.add('button', undefined, 'Yes', {name: 'ok'});
    var noButton = dialogWindow.add('button', undefined, 'No', {name: 'cancel'});
    yesButton.onClick = function () { 
        userSelection = 'yes'; 
        dialogWindow.close();
        return 'yes';
    }
    noButton.onClick = function () {
        userSelection = 'no';
        dialogWindow.close();
        return 'no';
    }
    if (dialogWindow.show() == 1) {
        return;
    } else {
        return userSelection;
    }
}

/**
 * Create a path to a .iconset folder that will be created from the current active document.
 * @returns {string} a file path to an iconset folder that will be created
 */
function createIconsetFolderPathFromActiveDocument() {
    return decodeURI(app.activeDocument.path) + '/' + app.activeDocument.name.split('.').slice(0, -1).join('.') + '.iconset';
}

/**
 * Create a .iconset folder that will store the images for the current document
 * @param {string} folderPath - the path to the .iconset folder that images will be written to
 */
function createIconsetFolder(folderPath) {
    var folder = Folder(folderPath);
    if (!folder.exists) { folder.create(); }
}

/**
 * Create PNGs of different resolutions for the current document and export them to the .iconset folder
 * @param {string} iconsetFolderPath - path to the .iconset folder where the PNGs will be exported to.
 */
function exportIconsetPNGsToIconsetFolder(iconsetFolderPath) {
    for (var i = 0; i < FILE_NAMES.length; i++) {
        app.activeDocument.resizeImage(UnitValue(ICON_DIMENSIONS[i], PIXELS), UnitValue(ICON_DIMENSIONS[i], PIXELS));
        savePNG(iconsetFolderPath, FILE_NAMES[i]);
    }
}

/**
 * Export the current state of the active document to a PNG
 * @param {string} outputFilePath - the folder where the PNG will be saved
 * @param {string} fileName - the file name of the PNG
 */
function savePNG(outputFilePath, fileName) {
	// Create export settings.
	var opts = new ExportOptionsSaveForWeb();
	opts.format = SaveDocumentType.PNG;
	opts.PNG8 = false;
	opts.quality = 100;

	// Export PNG file and save to computer.
	var file = new File(outputFilePath + '/' + fileName);
	app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, opts);	
}

/**
 * Converts a regular .iconset folder path to one where special characters ([, \, ?, $, ...) are escaped.
 * @param {string} iconsetFolderPath - the folder path that will be escaped
 * @returns {string} the .iconset folder path where special characters are escaped
 */
function createEscapedIconsetFolderPath(iconsetFolderPath) {
    const SPECIAL_CHARACTERS_REGEX = /[-[\]{}()*+?.,\\^$|#\s]/g
    const FORWARD_SLASH = '\\$&'
    var escapedIconsetFolderPath = iconsetFolderPath.replace(SPECIAL_CHARACTERS_REGEX, FORWARD_SLASH);
    return escapedIconsetFolderPath
}

/**
 * Execute a bash/shell command where an .iconset folder will be converted into an ICNS
 * @param {string} iconsetFolderPath - the path to the .iconset folder that will be converted to ICNS
 */
function convertIconsetFolderToICNS(iconsetFolderPath) {
    const SHELL_COMMAND_CREATE_ICNS_FROM_ICONSET_FOLDER = 'iconutil -c icns ';
    app.system(SHELL_COMMAND_CREATE_ICNS_FROM_ICONSET_FOLDER + iconsetFolderPath + '');
}

/**
 * Execute a bash/shell command where an .iconset folder will be deleted
 * @param {string} iconsetFolderPath - the path to the .iconset folder that will be deleted.
 */
function deleteIconsetFolder(iconsetFolderPath) {
    const SHELL_COMMAND_DELETE_ICONSET_FOLDER = 'rm -rf ';
    app.system(SHELL_COMMAND_DELETE_ICONSET_FOLDER + iconsetFolderPath + '');
}

/**
 * Terminate and exit the program with an exit code.
 * @param {number} exitCode - the exit code for the program's termination.
 */
function exit(exitCode) {
    var exitMessage = ERROR_MESSAGES[exitCode]
    throw new Error(exitMessage);
}

/**
 * Checks if a string is null or empty
 * @param {string} str - the string to look at
 * @returns {boolean} TRUE if the string is null or undefined, FALSE otherwise 
 */
function stringIsNullOrEmpty(str) {
	return str == null || str == undefined;
}

try{
    main();
} catch (err) {
    if (stringIsNullOrEmpty(err.message)) { alert(ENDING_SCRIPT_STRING); }
    else { alert(err.message + ' ' + ENDING_SCRIPT_STRING); }
}
