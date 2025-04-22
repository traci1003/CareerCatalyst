// This script is for creating basic sound effect files
// You can use this to generate MP3 files for the sound effects

function createAudioFile(base64Data, fileName) {
  // Convert the base64 data to a Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/mp3' });
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  
  // Append to the body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Example of how to use this script:
// 1. Get a base64-encoded MP3 file
// 2. Call createAudioFile with the base64 data and desired filename

// createAudioFile('BASE64_STRING_HERE', 'click.mp3');
// createAudioFile('BASE64_STRING_HERE', 'success.mp3');
// createAudioFile('BASE64_STRING_HERE', 'error.mp3');
// createAudioFile('BASE64_STRING_HERE', 'notification.mp3');