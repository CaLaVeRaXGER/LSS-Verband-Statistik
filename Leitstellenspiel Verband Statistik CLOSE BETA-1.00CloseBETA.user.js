// ==UserScript==
// @name         Leitstellenspiel Verband Statistik
// @namespace    http://tampermonkey.net/
// @version      1.20
// @description  Zeigt Statistiken des Verbandes im Leitstellenspiel als ausklappbares Menü an
// @author       Fabian (Capt.BobbyNash)
// @match        https://www.leitstellenspiel.de/
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function () {
  "use strict";

  // Funktion, um die API anzufragen und Daten zu verarbeiten
  function fetchAllianceInfo() {
    console.log("Abrufen der API-Daten...");
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://www.leitstellenspiel.de/api/allianceinfo",
      onload: function (response) {
        console.log("API Antwort erhalten", response);
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            console.log("Geparste API-Daten:", data);
            updateAllianceStatistics(data);
          } catch (e) {
            console.error("Fehler beim Parsen der API-Daten:", e);
          }
        } else {
          console.error("Fehler beim Abrufen der API-Daten: ", response.status);
        }
      },
      onerror: function () {
        console.error("Fehler beim Abrufen der API-Daten.");
      },
    });
  }

  // Funktion, um die Statistiken im Menü zu aktualisieren
  function updateAllianceStatistics(data) {
    if (!data) {
      console.error("Datenobjekt ist nicht definiert.");
      return;
    }

    const allianceName = data.name || "Unbekannt"; // Name des Verbands
    const allianceId = data.id || "#"; // ID des Verbands
    const totalCredits = data.credits_total || 0; // Gesamtverdiente Credits
    const currentCredits = data.credits_current || 0; // Aktuelle Credits (Verbandskasse)
    const totalMembers = data.user_count || 0; // Mitgliederanzahl
    const rank = data.rank || "Unbekannt";
    const totalMissions = data.missions_total || "Daten nicht verfügbar"; // Annahme: API liefert missions_total
    const creditsLast24h = data.credits_last_24h || "Daten nicht verfügbar"; // Annahme: API liefert credits_last_24h

    console.log("Aktualisierte Statistiken: ", {
      allianceName,
      totalCredits,
      currentCredits,
      totalMembers,
      rank,
      totalMissions,
      creditsLast24h,
    });

    // Überprüfen, ob das Dropdown-Menü bereits existiert
    let dropdownMenu = $('#alliance-statistics-menu');
    if (dropdownMenu.length === 0) {
      // Menüeintrag für die Statistiken erstellen
      const menuEntry = $('<li class="dropdown"></li>');

      // Link für das Dropdown-Menü
      const dropdownLink = $(
        '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Verband Statistiken <span class="caret"></span></a>'
      );

      // Dropdown-Menü-Container erstellen
      dropdownMenu = $('<ul id="alliance-statistics-menu" class="dropdown-menu" role="menu"></ul>').css({
        padding: "10px",
        minWidth: "250px",
        backgroundColor: "#000000", // Schwarzer Hintergrund
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        color: "white", // Weiße Schrift
      });

      // Name des Verbands hinzufügen, mit Link zur Verbandsseite
      dropdownMenu.append(
        `<li><a href="https://www.leitstellenspiel.de/alliances/${allianceId}" style="color: white; font-size: 14px;"><strong>Verband:</strong> <span style="color: green;" class="alliance-name">${allianceName}</span></a></li>`
      );
      dropdownMenu.append(
        `<li class="divider"></li>` // Trennlinie
      );

      // Statistiken hinzufügen
      dropdownMenu.append(
        `<li><a href="#" style="color: white;"><strong>Gesamtverdiente Credits:</strong> <span style="color: green;" class="total-credits">${totalCredits.toLocaleString()}</span></a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white;"><strong>Verbandskasse:</strong> <span style="color: green;" class="current-credits">${currentCredits.toLocaleString()}</span></a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white;"><strong>Mitglieder:</strong> <span style="color: green;" class="total-members">${totalMembers}</span></a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white;"><strong>Rang:</strong> <span style="color: green;" class="rank">${rank}</span></a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white;"><strong>Gesamteinsätze:</strong> <span style="color: green;" class="total-missions">${totalMissions}</span></a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white;"><strong>Credits in den letzten 24 Stunden:</strong> <span style="color: green;" class="credits-last-24h">${creditsLast24h}</span></a></li>`
      );

      // Infobox mit Ersteller, Version und Funktionen hinzufügen
      dropdownMenu.append(
        `<li class="divider"></li>` // Trennlinie
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white; font-size: 12px;">Ersteller: Fabian (Capt.BobbyNash)</a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white; font-size: 12px;">Version: 1.20</a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white; font-size: 12px;">Funktionen des Skripts:</a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white; font-size: 12px;">- Anzeige der Verband-Statistiken</a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white; font-size: 12px;">- Übersicht über Credits, Mitglieder, Rang und Einsätze</a></li>`
      );
      dropdownMenu.append(
        `<li><a href="#" style="color: white; font-size: 12px;">- Anzeige der Credits der letzten 24 Stunden</a></li>`
      );

      // Neuer Menüpunkt für das Admin Panel hinzufügen
      dropdownMenu.append(
        `<li class="divider"></li>` // Trennlinie
      );
      dropdownMenu.append(
        `<li><a href="https://www.leitstellenspiel.de/admin" style="color: white;">Verbands Admin Panel</a></li>`
      );

      // Button für die Aktualisierung hinzufügen
      dropdownMenu.append(
        `<li class="divider"></li>` // Trennlinie
      );
      dropdownMenu.append(
        `<li><a href="#" id="refresh-stats" style="color: white;">Aktualisieren</a></li>`
      );

      // Menüeintrag zusammenfügen
      menuEntry.append(dropdownLink);
      menuEntry.append(dropdownMenu);

      // Menüeintrag zum Hauptmenü hinzufügen
      const navbar = $('#navbar-main-collapse .navbar-nav');
      if (navbar.length) {
        navbar.append(menuEntry);
        console.log("Menüeintrag hinzugefügt");

        // Aktualisieren Button click event
        $('#refresh-stats').on('click', function (event) {
          event.preventDefault();
          console.log("Aktualisieren Button geklickt");
          fetchAllianceInfo();
        });
      } else {
        console.error("Navigationsleiste nicht gefunden");
      }
    } else {
      // Menü existiert bereits, nur die Statistiken aktualisieren
      console.log("Aktualisieren des vorhandenen Menüs...");
      $('#alliance-statistics-menu .alliance-name').text(allianceName).attr('href', `https://www.leitstellenspiel.de/alliances/${allianceId}`);
      $('#alliance-statistics-menu .total-credits').text(totalCredits.toLocaleString());
      $('#alliance-statistics-menu .current-credits').text(currentCredits.toLocaleString());
      $('#alliance-statistics-menu .total-members').text(totalMembers);
      $('#alliance-statistics-menu .rank').text(rank);
      $('#alliance-statistics-menu .total-missions').text(totalMissions);
      $('#alliance-statistics-menu .credits-last-24h').text(creditsLast24h);
    }
  }

  // Skript ausführen, wenn die Seite vollständig geladen ist
  $(document).ready(function () {
    console.log("Skript geladen und bereit");
    fetchAllianceInfo();
  });
})();
