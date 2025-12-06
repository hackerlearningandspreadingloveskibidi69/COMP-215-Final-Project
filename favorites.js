$(document).ready(function() {
  const favorites = getFavorites();

  if (favorites.length === 0) {
    $("#favorites-container").html("<p>You haven't saved any events yet.</p>");
    return;
  }

  $.getJSON("data/events.json")
    .done(function(data) {
      const favEvents = data.filter(e => favorites.includes(e.id));
      renderFavorites(favEvents);
    })
    .fail(function() {
      $("#favorites-container").html("<p>Could not load favorites. Try again later.</p>");
    });

  function renderFavorites(events) {
    $("#favorites-container").empty();
    events.forEach(event => {
      $("#favorites-container").append(`
        <div class="event-card favorite">
          <img src="${event.image || 'default.jpg'}" alt="${event.title}">
          <h3>${event.title}</h3>
          <p>${event.date} @ ${event.location}</p>
          <button onclick="removeFavorite(${event.id}); location.reload();">Remove</button>
        </div>
      `);
    });
  }
});
