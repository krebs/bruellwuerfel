function renderHistory(messages) {
  return messages
    .map(message => `<dt>${message.sender}</dt><dd>${message.text}</dd>`)
    .join("\n");
}

function renderShoutbox(div) {
  const input = document.createElement("input");
  input.id = "message-input";

  const submit = document.createElement("button");
  submit.id = "message-send";
  submit.innerHTML = "Send";

  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      // if enter
      event.preventDefault();
      document.getElementById("message-send").click();
    }
  });

  submit.onclick = function() {
    const messageText = input.value;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function() {
      input.value = "";
    };
    xhr.send(JSON.stringify({ message: messageText }));
  };

  const dl = document.createElement("dl");
  dl.id = "irc-history";

  div.appendChild(dl);
  div.appendChild(input);
  div.appendChild(submit);
}

(function refresher() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:3000?limit=10", true);
  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const messages = JSON.parse(xhr.responseText);
        document.getElementById("irc-history").innerHTML = renderHistory(
          messages
        );
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function(e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);

  setTimeout(refresher, 500);
})();
