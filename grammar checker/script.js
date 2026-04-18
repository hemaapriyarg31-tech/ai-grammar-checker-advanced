let matches = [];
let originalText = "";

async function checkGrammar() {
  let editor = document.getElementById("editor");
  let text = editor.innerText;

  if (!text.trim()) {
    alert("Enter text first");
    return;
  }

  originalText = text;

  let url = "https://api.languagetool.org/v2/check";

  let params = new URLSearchParams();
  params.append("text", text);
  params.append("language", "en-US");

  let response = await fetch(url, {
    method: "POST",
    body: params
  });

  let data = await response.json();
  matches = data.matches;

  highlightErrors(text, matches);
  showResults(matches);
}

function highlightErrors(text, matches) {
  let resultHTML = "";
  let lastIndex = 0;

  matches.forEach(match => {
    let start = match.offset;
    let end = start + match.length;

    resultHTML += text.substring(lastIndex, start);
    resultHTML += `<span class="error">${text.substring(start, end)}</span>`;

    lastIndex = end;
  });

  resultHTML += text.substring(lastIndex);

  document.getElementById("editor").innerHTML = resultHTML;
}

function showResults(matches) {
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  if (matches.length === 0) {
    resultDiv.innerHTML = "<p>No errors found ✅</p>";
    return;
  }

  matches.forEach(m => {
    let suggestions = m.replacements.map(r => r.value).join(", ");

    resultDiv.innerHTML += `
      <p>
        ❌ ${m.message}<br>
        💡 Suggestions: ${suggestions}
      </p>
      <hr>
    `;
  });
}

function autoCorrect() {
  let text = originalText;

  matches.forEach(match => {
    if (match.replacements.length > 0) {
      let suggestion = match.replacements[0].value;
      text = text.substring(0, match.offset) +
             suggestion +
             text.substring(match.offset + match.length);
    }
  });

  document.getElementById("editor").innerText = text;
}

function startSpeech() {
  let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = function(event) {
    let speechText = event.results[0][0].transcript;
    document.getElementById("editor").innerText += " " + speechText;
  };

  recognition.start();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}