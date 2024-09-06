const eyeDropper = new EyeDropper();
const button = document.getElementById('pick');
const dotElement = document.getElementById('dot');
const dotElements = document.querySelectorAll('.dot2');
const logo = document.getElementById('logo'); // Added logo element

let selectedColor = null;

// Load stored colors on extension load
window.onload = () => {
  chrome.storage.local.get(['colors'], (result) => {
    const colors = result.colors || [];
    colors.forEach((color, index) => {
      if (dotElements[index]) {
        dotElements[index].style.backgroundColor = color;
        dotElements[index].style.color = getTextColorBasedOnBg(color);
        dotElements[index].textContent = color;
        dotElements[index].classList.add('active'); // Ensure the active class is added here
      }
    });
  });
};

// Use EyeDropper to pick a color
async function useEyeDropper() {
  try {
    const colorResult = await eyeDropper.open();
    selectedColor = colorResult.sRGBHex;
    
    dotElement.style.backgroundColor = selectedColor;
    dotElement.textContent = selectedColor;
    changeTextColor(selectedColor);
    dotElement.classList.remove('inactive');
    dotElement.classList.add('active');
  } catch (err) {
    console.log('Eye dropper cancelled');
  }
}

// Function to update the dot2 queue
function updateDotQueue() {
  if (selectedColor) {
    chrome.storage.local.get(['colors'], (result) => {
      let colors = result.colors || [];
      
      // Add the selected color to the start of the array and remove the last element if there are more than 9
      colors.unshift(selectedColor);
      if (colors.length > 6) colors.pop();

      chrome.storage.local.set({ colors });

      // Apply colors and text to the dot2 elements
      colors.forEach((color, index) => {
        if (dotElements[index]) {
          dotElements[index].style.backgroundColor = color;
          dotElements[index].style.color = getTextColorBasedOnBg(color);
          dotElements[index].textContent = color;
          dotElements[index].classList.add('active'); // Ensure the active class is added here
        }
      });
      
    });
  }
}

// Change text color based on background color brightness
function changeTextColor(bgColor) {
  const textColor = getTextColorBasedOnBg(bgColor);
  dotElement.style.color = textColor;
}

function getTextColorBasedOnBg(bgColor) {
  const color = bgColor.substring(1); // Remove '#'
  const rgb = parseInt(color, 16); // Convert hex to integer
  const r = (rgb >> 16) & 0xff; // Extract red
  const g = (rgb >>  8) & 0xff; // Extract green
  const b = (rgb >>  0) & 0xff; // Extract blue

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? 'black' : 'white';
}

// Event listener for the pick button to trigger EyeDropper and update the queue
button.addEventListener('click', () => {
  useEyeDropper().then(() => {
    updateDotQueue();
  });
});

// Event listener for double-click to copy the hex value to clipboard (only when dot is active)
dotElement.addEventListener('dblclick', () => {
  if (dotElement.classList.contains('active')) {
    copyToClipboard(dotElement.textContent);
  }
});

// Event listeners for each dot2 element to copy their hex values to clipboard on double click
dotElements.forEach(dot => {
  dot.addEventListener('dblclick', () => {
    if (dot.textContent) { // Remove the 'active' check to always allow copying if there's a hex value
      console.log('Dot double-clicked:', dot.textContent); // Log to check if this runs
      copyToClipboard(dot.textContent);
    }
  });
});

// Event listener for the logo to reset all dot2 elements
logo.addEventListener('click', () => {
  chrome.storage.local.remove('colors', () => {
    dotElements.forEach(dot => {
      dot.style.backgroundColor = '';
      dot.style.color = '';
      dot.textContent = '';
      dot.classList.remove('active'); // Also remove the active class here
    });
  });
});

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
