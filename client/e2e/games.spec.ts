import { expect, test } from "@playwright/test";

test("shows the available games and filters them by genre", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(
    page.getByText("Adventure", { exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();

  await page.getByLabel("Genre:").selectOption("7");

  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).not.toBeVisible();
});

test("searches games by title", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await page
    .getByRole("searchbox", { name: "Search games by title" })
    .fill("puzzle");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(
    page.getByRole("heading", { name: "Puzzle Quest" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).not.toBeVisible();
});

test("opens a game details page and returns to the game list", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Sample Adventure" }).click();

  await expect(page).toHaveURL(/\/games\/101$/);
  await expect(
    page.getByRole("heading", { name: "Sample Adventure" }),
  ).toBeVisible();
  await expect(page.getByText("A story-driven adventure.")).toBeVisible();
  await expect(page.getByText("Studio North")).toBeVisible();
  await expect(page.getByText("A great game from start to finish.")).toBeVisible();

  await page.getByRole("link", { name: "Back to games" }).click();
  await expect(page).toHaveURL("/");
});
