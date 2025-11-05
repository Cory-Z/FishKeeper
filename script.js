var API = "http://127.0.0.1:3000";
var selectedId = null;     // id when an existing suggestion is chosen
var lastMatches = [];      // cache for suggestion list


function loadFish() {

  var x = new XMLHttpRequest();
  x.open("GET", API + "/fish", true);
  x.onload = function() {
    if (x.status === 200) {

      var list = JSON.parse(x.responseText);
      var table = document.getElementById("fishTable");
      table.innerHTML =
        '<tr style="background-color: azure;">' +
        '<th>Fish Name</th><th>Minimum Size to Keep (in inches)</th><th>Actions</th></tr>';

      for (var i = 0; i < list.length; i++) {
        var row = table.insertRow();
        row.innerHTML =
          "<td>" + list[i].name + "</td>" +
          "<td>" + list[i].minSizeInInches + "</td>" +
          "<td>" +
            '<button onclick="delFish(' + list[i].id + ');">Delete</button> ' +
            '<button onclick="editFish(' + list[i].id + ');">Update</button>' +
          "</td>";
      }

      document.getElementById("hideButton").style.display = "inline";
    }
  };
  x.send();
}

//HIDE table
function hideFish() {
  var table = document.getElementById("fishTable");
  table.innerHTML =
    '<tr style="background-color: azure;">' +
    '<th>Fish Name</th><th>Minimum Size to Keep (in inches)</th><th>Actions</th></tr>';

  
  document.getElementById("hideButton").style.display = "none";
}

function renderSuggestions() {
  var box = document.getElementById("suggestions");
  var html = "";
  if (!lastMatches.length) {
    html = '<div style="padding:6px;">Fish not found</div>';
    // Allow user to add by entering size
    document.getElementById("fishSize").disabled = false;
  } else {
    for (var i = 0; i < lastMatches.length; i++) {
      html += '<div style="padding:6px; cursor:pointer;" onclick="choose(' +
              lastMatches[i].id + ');">' + lastMatches[i].name + '</div>';
    }
  }
  box.innerHTML = html;
  box.style.display = "block";
}

function hideSuggestions() {
  var box = document.getElementById("suggestions");
  box.style.display = "none";
  box.innerHTML = "";
}

function choose(id) {
  hideSuggestions();
  var i, item = null;
  for (i = 0; i < lastMatches.length; i++) {
    if (lastMatches[i].id === id) { item = lastMatches[i]; break; }
  }
  if (!item) return;

  selectedId = item.id;
  document.getElementById("fishName").value = item.name;

  // Pull authoritative size from server
  var x = new XMLHttpRequest();
  x.open("GET", API + "/fish/by-name?name=" + encodeURIComponent(item.name), true);
  x.onload = function() {
    if (x.status === 200) {
      var found = JSON.parse(x.responseText);
      if (found && found.minSizeInInches != null) {
        document.getElementById("fishSize").value = found.minSizeInInches;
        document.getElementById("fishSize").disabled = true; // cannot edit known fish here
      }
    }
  };
  x.send();
}

// ========== Add or Update (decides based on selectedId) ==========
function saveFish() {
  var name = (document.getElementById("fishName").value || "").trim();

  if (!name) {
    alert("Enter a fish name.");
    return;
  }

  if (selectedId) {
    // Update existing via prompt (same UX you liked)
    var current = document.getElementById("fishSize").value;
    var newSize = prompt("Enter new minimum size (in inches) for " + name + ":", current);
    if (newSize === null || newSize === "") return;

    var x = new XMLHttpRequest();
    x.open("PUT", API + "/fish/update?id=" + encodeURIComponent(selectedId) +
                   "&size=" + encodeURIComponent(newSize), true);
    x.onload = function() {
      if (x.status === 200) {
        loadFish();
        document.getElementById("fishSize").value = newSize;
      }
    };
    x.send();
  } else {
    // Add new fish (user must enter size first)
    var sizeBox = document.getElementById("fishSize");
    if (sizeBox.disabled || !sizeBox.value) {
      alert("Fish not found. Enter the minimum size (in inches) to add it.");
      sizeBox.disabled = false;
      return;
    }
    var size = sizeBox.value;

    var x2 = new XMLHttpRequest();
    x2.open("POST", API + "/fish/add?name=" + encodeURIComponent(name) +
                      "&size=" + encodeURIComponent(size), true);
    x2.onload = function() {
      if (x2.status === 200) {
        loadFish();
        document.getElementById("fishName").value = "";
        document.getElementById("fishSize").value = "";
        document.getElementById("fishSize").disabled = true;
      }
    };
    x2.send();
  }
}

// ========== Delete & Edit buttons ==========
function delFish(id) {
  // ⚠️ NOT IN EXAMPLE: XMLHttpRequest
  var x = new XMLHttpRequest();
  x.open("DELETE", API + "/fish/delete?id=" + encodeURIComponent(id), true);
  x.onload = function() {
    if (x.status === 200) loadFish();
  };
  x.send();
}

function editFish(id) {
  // Pull current size to prefill prompt
  var x = new XMLHttpRequest();
  x.open("GET", API + "/fish", true);
  x.onload = function() {
    if (x.status === 200) {
      var list = JSON.parse(x.responseText);
      var i, item = null;
      for (i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) item = list[i];

      var newSize = prompt("Enter new minimum size (in inches) for " + (item ? item.name : "fish") + ":",
                           item ? item.minSizeInInches : "");
      if (newSize === null || newSize === "") return;

      var x2 = new XMLHttpRequest();
      x2.open("PUT", API + "/fish/update?id=" + encodeURIComponent(id) +
                        "&size=" + encodeURIComponent(newSize), true);
      x2.onload = function() {
        if (x2.status === 200) loadFish();
      };
      x2.send();
    }
  };
  x.send();
}

// Close suggestion box when clicking elsewhere
document.addEventListener("click", function(e) {
  var box = document.getElementById("suggestions");
  if (!box.contains(e.target) && e.target.id !== "fishName") hideSuggestions();
});