var API = "http://127.0.0.1:3000";
var selectedId = null;
var lastMatches = [];


function loadFish() {
  var loadRequest = new XMLHttpRequest();
  loadRequest.open("GET", API + "/fish", true);
  loadRequest.onload = function() {
    if (loadRequest.status === 200) {
      var list = JSON.parse(loadRequest.responseText);
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
  loadRequest.send();
}


function hideFish() {
  var table = document.getElementById("fishTable");
  table.innerHTML =
    '<tr style="background-color: azure;">' +
    '<th>Fish Name</th><th>Minimum Size to Keep (in inches)</th><th>Actions</th></tr>';

  document.getElementById("hideButton").style.display = "none";
}


function suggest() {
  var nameBox = document.getElementById("fishName");
  var q = nameBox.value.trim();
  selectedId = null;
  document.getElementById("fishSize").value = "";
  document.getElementById("fishSize").disabled = true;

  if (!q) {
    hideSuggestions();
    return;
  }

  var searchRequest = new XMLHttpRequest();
  searchRequest.open("GET", API + "/fish/search?query=" + encodeURIComponent(q), true);
  searchRequest.onload = function() {
    if (searchRequest.status === 200) {
      lastMatches = JSON.parse(searchRequest.responseText) || [];
      renderSuggestions();
    }
  };
  searchRequest.send();
}


function renderSuggestions() {
  var box = document.getElementById("suggestions");
  var html = "";
  if (!lastMatches.length) {
    html = '<div style="padding:6px;">Fish not found</div>';
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
  var item = null;
  for (var i = 0; i < lastMatches.length; i++) {
    if (lastMatches[i].id === id) { item = lastMatches[i]; break; }
  }
  if (!item) return;

  selectedId = item.id;
  document.getElementById("fishName").value = item.name;

  var lookupRequest = new XMLHttpRequest();
  lookupRequest.open("GET", API + "/fish/by-name?name=" + encodeURIComponent(item.name), true);
  lookupRequest.onload = function() {
    if (lookupRequest.status === 200) {
      var found = JSON.parse(lookupRequest.responseText);
      if (found && found.minSizeInInches != null) {
        document.getElementById("fishSize").value = found.minSizeInInches;
        document.getElementById("fishSize").disabled = true;
      }
    }
  };
  lookupRequest.send();
}


function saveFish() {
  var name = (document.getElementById("fishName").value || "").trim();

  if (!name) {
    alert("Enter a fish name.");
    return;
  }

  if (selectedId) {
    var current = document.getElementById("fishSize").value;
    var newSize = prompt("Enter new minimum size (in inches) for " + name + ":", current);
    if (newSize === null || newSize === "") return;

    var updateRequest = new XMLHttpRequest();
    updateRequest.open("PUT", API + "/fish/update?id=" + encodeURIComponent(selectedId) +
   "&size=" + encodeURIComponent(newSize), true);
    updateRequest.onload = function() {
      if (updateRequest.status === 200) {
        loadFish();
        document.getElementById("fishSize").value = newSize;
      }
    };
    updateRequest.send();

  } else {
    var sizeBox = document.getElementById("fishSize");
    if (sizeBox.disabled || !sizeBox.value) {
      alert("Fish not found. Enter the minimum size (in inches) to add it.");
      sizeBox.disabled = false;
      return;
    }
    var size = sizeBox.value;

    var addRequest = new XMLHttpRequest();
    addRequest.open("POST", API + "/fish/add?name=" + encodeURIComponent(name) +
   "&size=" + encodeURIComponent(size), true);
    addRequest.onload = function() {
      if (addRequest.status === 200) {
        loadFish();
        document.getElementById("fishName").value = "";
        document.getElementById("fishSize").value = "";
        document.getElementById("fishSize").disabled = true;
      }
    };
    addRequest.send();
  }
}


function delFish(id) {
  var deleteRequest = new XMLHttpRequest();
  deleteRequest.open("DELETE", API + "/fish/delete?id=" + encodeURIComponent(id), true);
  deleteRequest.onload = function() {
    if (deleteRequest.status === 200) loadFish();
  };
  deleteRequest.send();
}


function editFish(id) {
  var pullRequest = new XMLHttpRequest();
  pullRequest.open("GET", API + "/fish", true);
  pullRequest.onload = function() {
    if (pullRequest.status === 200) {
      var list = JSON.parse(pullRequest.responseText);
      var item = null;
      for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) item = list[i];

      var newSize = prompt("Enter new minimum size (in inches) for " + (item ? item.name : "fish") + ":",
tem ? item.minSizeInInches : "");
      if (newSize === null || newSize === "") return;

      var updateRequest = new XMLHttpRequest();
      updateRequest.open("PUT", API + "/fish/update?id=" + encodeURIComponent(id) +
   "&size=" + encodeURIComponent(newSize), true);
      updateRequest.onload = function() {
        if (updateRequest.status === 200) loadFish();
      };
      updateRequest.send();
    }
  };
  pullRequest.send();
}


document.addEventListener("click", function(e) {
  var box = document.getElementById("suggestions");
  if (!box.contains(e.target) && e.target.id !== "fishName") hideSuggestions();
});