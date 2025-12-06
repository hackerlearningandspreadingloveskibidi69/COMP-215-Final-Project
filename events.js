$(document).ready(function() {
  let eventsData = [];
  let selectedIndex = -1; // track which suggestion is highlighted

  // Load events
  $.getJSON("eventsdemo.json")
    .done(function(data) {
      eventsData = data;
      renderEvents(eventsData);

      // Attach search handler AFTER data is loaded
      $("#search").on("input", function() {
        const term = $(this).val().toLowerCase();
        selectedIndex = -1;

        if (term.length === 0) {
          $("#suggestions").empty();
          return;
        }

        const matches = eventsData.filter(e =>
          e.title.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          (e.tags && e.tags.some(tag => tag.toLowerCase().includes(term)))
        );

        console.log("Matches found:", matches);

        $("#suggestions").empty(); // clear before appending

        if (matches.length === 0) {
          $("#suggestions").append(`<li>No matching events found</li>`);
          return;
        }

        matches.slice(0, 5).forEach(event => {
          $("#suggestions").append(`<li data-id="${event.id}">${event.title}</li>`);
        });
      });
    })
    .fail(function() {
      $("#events").html("<p>Failed to load events. Please try again later.</p>");
    });

  // Render event cards
  function renderEvents(events) {
    $("#events").empty();
    if (events.length === 0) {
      $("#events").html("<p>No events found.</p>");
      return;
    }
    events.forEach(event => {
      $("#events").append(`
        <div class="card" data-id="${event.id}">
          <img src="${event.image || 'default.jpg'}" alt="${event.title}">
          <div class="card-content">
            <h3>${event.title}</h3>
            <p>${event.date} @ ${event.location}</p>
            <p>${event.category}</p>
          </div>
        </div>
      `);
    });
  }

  // Click suggestion → show event
  $(document).on("click", "#suggestions li", function() {
    const id = $(this).data("id");
    const event = eventsData.find(e => e.id == id);
    if (event) {
      renderEvents([event]);
      $("#search").val(event.title);
    }
    $("#suggestions").empty();
  });

  // Keyboard navigation for suggestions
  $("#search").on("keydown", function(e) {
    const items = $("#suggestions li");
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      items.removeClass("highlight");
      $(items[selectedIndex]).addClass("highlight");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      items.removeClass("highlight");
      $(items[selectedIndex]).addClass("highlight");
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const chosen = $(items[selectedIndex]);
        const id = chosen.data("id");
        const event = eventsData.find(e => e.id == id);
        if (event) {
          renderEvents([event]);
          $("#search").val(event.title);
        }
        $("#suggestions").empty();
      } else {
        $("#searchBtn").click(); // fallback to normal search
      }
    } else if (e.key === "Escape") {
      $("#suggestions").empty();
    }
  });

  // Search button click
  $("#searchBtn").click(function() {
    const term = $("#search").val().toLowerCase();
    const filtered = eventsData.filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term) ||
      (e.tags && e.tags.some(tag => tag.toLowerCase().includes(term)))
    );
    renderEvents(filtered);
    $("#suggestions").empty();
  });

  // Category filter
  $(".chip").click(function() {
    const category = $(this).data("category");
    const filtered = eventsData.filter(e => e.category === category);
    renderEvents(filtered);
  });

  // Sorting
  $("#sort").change(function() {
    const value = $(this).val();
    let sorted = [...eventsData];

    sorted.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return value === "dateAsc" ? dateA - dateB : dateB - dateA;
    });

    renderEvents(sorted);
  });
});
