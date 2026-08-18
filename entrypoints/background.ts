export default defineBackground(() => {
  console.log('Flow Background Service Worker started');

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return true;
  });
});
