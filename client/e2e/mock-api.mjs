import { createServer } from "node:http";

const games = [
  {
    id: 101,
    title: "Sample Adventure",
    description: "A story-driven adventure.",
    release_date: "2024-05-10",
    developer: { name: "Studio North" },
    genre: { id: 7, name: "Adventure" },
    images: [
      {
        image_type: "Cover",
        image_url: "https://images.example/sample-adventure.jpg",
      },
    ],
  },
  {
    id: 202,
    title: "Puzzle Quest",
    description: "A thoughtful puzzle game.",
    release_date: "2023-09-18",
    developer: { name: "Studio South" },
    genre: { id: 9, name: "Puzzle" },
    images: [
      {
        image_type: "Cover",
        image_url: "https://images.example/puzzle-quest.jpg",
      },
    ],
  },
];

const reviews = [
  {
    id: 1,
    rating: 5,
    review_text: "A great game from start to finish.",
    user: { username: "player-one" },
  },
];

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:8010");
  const path = url.pathname.replace("/api/v1", "");

  if (path === "/genres") {
    return sendJson(response, 200, {
      data: [
        { id: 7, name: "Adventure" },
        { id: 9, name: "Puzzle" },
      ],
    });
  }

  if (path === "/games") {
    const genreId = url.searchParams.get("genre");
    const searchTerm = url.searchParams.get("search")?.toLowerCase();
    const matchingGames = games.filter((game) => {
      const matchesGenre = !genreId || String(game.genre.id) === genreId;
      const matchesSearch =
        !searchTerm || game.title.toLowerCase().includes(searchTerm);
      return matchesGenre && matchesSearch;
    });
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 12);

    return sendJson(response, 200, {
      data: matchingGames,
      _metadata: {
        page,
        limit,
        total: matchingGames.length,
        totalPages: Math.max(1, Math.ceil(matchingGames.length / limit)),
      },
    });
  }

  const gameStats = /^\/games\/(\d+)\/stats$/.exec(path);
  if (gameStats) {
    return sendJson(response, 200, {
      data: { average_rating: 4.6, total_reviews: 18 },
    });
  }

  const gameDetails = /^\/games\/(\d+)$/.exec(path);
  if (gameDetails) {
    const game = games.find((item) => String(item.id) === gameDetails[1]);
    if (!game) {
      return sendJson(response, 404, { error: { message: "Game not found" } });
    }

    return sendJson(response, 200, {
      data: { ...game, reviews },
    });
  }

  return sendJson(response, 404, { error: { message: "Not found" } });
});

server.listen(8010, "127.0.0.1");
