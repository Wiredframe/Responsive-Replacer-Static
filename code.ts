// Function for loading all fonts used in a text node
const loadFonts = async (textNode: TextNode) => {
  // Get an array of all the font names used in the text node
  const fontNames = textNode.getRangeAllFontNames(0, textNode.characters.length);

  // Load all the fonts asynchronously
  await Promise.all(fontNames.map(figma.loadFontAsync));
};

// Define the old and new font sizes as arrays
const oldFontSizes = [4, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const newFontSizes = [4, 8, 16, 24, 24, 32, 32, 32, 32, 48, 56,  64,  64, 5, 10, 15, 15, 20, 25, 25, 25, 30, 30, 30, 35, 35, 35, 40, 40, 40, 45, 45, 50];

// Define the old and new line heights as arrays
const skipLineHeights = false;
const oldLineHeights = [4, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const newLineHeights = [4, 8, 16, 24, 32, 32, 40, 48, 56, 64, 80,  96,  96, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];

// Get the selected frame
const selectedFrame = figma.currentPage.selection[0] as FrameNode;

if (selectedFrame) {
  const nodesToReplace = [];

  // Find all nodes with padding, gap, or font size values to replace
  function findNodesToReplace(node: BaseNode) {
    if ('paddingLeft' in node || 'paddingRight' in node || 'paddingTop' in node || 'paddingBottom' in node || 'itemSpacing' in node || 'gridStyleId' in node) {
      nodesToReplace.push(node);
    }

    if ('children' in node) {
      node.children.forEach(child => findNodesToReplace(child));
    }
  }

  findNodesToReplace(selectedFrame);

  // Replace padding and gap values in all nodes
  nodesToReplace.forEach(node => {
    if ('paddingLeft' in node) {
      node.paddingLeft = replacePaddingValue(node.paddingLeft);
    }

    if ('paddingRight' in node) {
      node.paddingRight = replacePaddingValue(node.paddingRight);
    }

    if ('paddingTop' in node) {
      node.paddingTop = replacePaddingValue(node.paddingTop);
    }

    if ('paddingBottom' in node) {
      node.paddingBottom = replacePaddingValue(node.paddingBottom);
    }

    if ('itemSpacing' in node) {
      node.itemSpacing = replacePaddingValue(node.itemSpacing);
    }

    if ('gridStyleId' in node) {
      node.gridStyleId = replacePaddingValue(node.gridStyleId);
    }
  });

  // Replace font sizes and line heights in all text nodes
  const textNodes = selectedFrame.findAll(node => node.type === "TEXT") as TextNode[];
  if (textNodes.length === 0) {
    // Show an error message if no text nodes are found
    figma.notify("Spacings updated successfully.");
    figma.closePlugin();
  } else {
    // Keep track of the number of fonts that are still loading
    let numFontsLoading = 0;

    textNodes.forEach(async textNode => {
      // Load all fonts used in the text node
      numFontsLoading++;
      await loadFonts(textNode);

      // Replace font size in the text node
      const oldIndex = oldFontSizes.indexOf(textNode.fontSize);
      if (oldIndex !== -1) {
        textNode.fontSize = newFontSizes[oldIndex];
      }

      // Replace line height in the text node
      const lineHeight = textNode.lineHeight.unit === "PIXELS" ? textNode.lineHeight.value : textNode.fontSize * textNode.lineHeight.value;
      const oldLineHeightIndex = oldLineHeights.indexOf(lineHeight);
      if (oldLineHeightIndex !== -1) {
        textNode.lineHeight = { unit: "PIXELS", value: newLineHeights[oldLineHeightIndex] };
      }

      // Reset the line height of the text node to "auto"
      if (skipLineHeights === true) {
        textNode.lineHeight = { unit: "AUTO" };
      }

      // Decrement the count of fonts that are still loading
      numFontsLoading--;
      if (numFontsLoading === 0) {
        // Close the plugin when all fonts have finished loading
        figma.notify("Font sizes and spacings updated successfully.");
        figma.closePlugin();
      }
    });
  }
} else {
  // Show an error message if no frame is selected
  figma.notify("Please select a frame.");
  figma.closePlugin();
}

function replacePaddingValue(value: number): number {
  const paddingValuesToReplace = [4, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const paddingNewValues =       [4, 8, 12, 20, 24, 24, 24, 28, 36, 40, 48, 56, 64,   5, 10, 15, 20, 20, 25, 30, 30, 30, 30, 30, 35, 35, 35, 40, 40, 40, 45, 45, 50];

  const index = paddingValuesToReplace.indexOf(value);
  if (index !== -1) {
    return paddingNewValues[index];
  }
  return value;
}