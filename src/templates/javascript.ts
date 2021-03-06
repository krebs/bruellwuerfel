export default `
const renderHistory = messages =>
  messages
    .map(message => "<dt>" + message.sender + "</dt><dd>" + message.text + "</dd>")
    .join("\\n");

const renderShoutbox = div => {
  const dl = document.createElement("dl");
  dl.id = "irc-history";

  const input = document.createElement("input");
  input.id = "message-input";

  const submit = document.createElement("button");
  submit.id = "message-send";
  submit.innerHTML = "Send";

  // click on enter
  input.addEventListener("keyup", event => {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("message-send").click();
    }
  });

  // send on click
  submit.onclick = () => {
    const messageText = input.value;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "messages", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = () => {
      input.value = "";
      window.scrollTo(0, document.body.scrollHeight);
    };
    xhr.send(JSON.stringify({ message: messageText }));
  };

  div.appendChild(dl);
  div.appendChild(input);
  div.appendChild(submit);
};

(function refresher(oldMessages) {
  const xhr = new XMLHttpRequest();
  let messages = [];
  xhr.open("GET", "messages?limit=10", true);
  xhr.onload = e => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        messages = JSON.parse(xhr.responseText);
        document.getElementById("irc-history").innerHTML = renderHistory(
          messages
        );
        if (JSON.stringify(oldMessages) !== JSON.stringify(messages)) {
          window.scrollTo(0, document.body.scrollHeight);
        }
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = e => console.error(xhr.statusText);
  xhr.send(null);

  setTimeout(() => refresher(messages), 500);
})();
`;
