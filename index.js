#!/usr/bin/env node

import axios from "axios";
import inquirer from "inquirer";
import open from "open";
import chalk from "chalk";
import * as dotenv from "dotenv";
dotenv.config();

let animeName = "";
let animeEpisode = 1;
let selectedIndex = 0;
let animeEpisodeData = {
  total_episodes: 1,
  animeTitle: "",
};
let animeList = [];
let animeTitle = [];
let animeId = [];

async function getData(url) {
  animeList = [];
  animeTitle = [];
  animeId = [];
  await axios.get(url).then((response) => {
    animeList = response.data;
    animeList.map((anime) => {
      animeTitle.push(anime.animeTitle);
      animeId.push(anime.animeId);
    });
  });
}

async function getEpisodeData(url) {
  await axios.get(url).then((response) => (animeEpisodeData = response.data));
}

// animeList.map(anime=>anime.animeTitle)

async function askAnimeName() {
  const anime = await inquirer.prompt({
    name: "anime_name",
    type: "input",
    message: chalk.yellow("Enter anime name:"),
    default() {
      return "One Piece";
    },
  });

  animeName = anime.anime_name;
}

async function askAnimeEpisode() {
  const anime = await inquirer.prompt({
    name: "anime_episode",
    type: "input",
    message: chalk.yellow("Enter episode number:"),
    default() {
      return 1;
    },
  });

  animeEpisode = anime.anime_episode;
}

async function showAnimeList(anime) {
  const animeResults = await inquirer.prompt({
    name: "anime_results",
    type: "list",
    message: `Result for ${anime}\n`,
    choices: animeTitle,
  });

  selectedIndex = animeTitle.indexOf(animeResults.anime_results);
}

await askAnimeName();
await getData(`${process.env.API}/search?keyw=${animeName}`);
if (animeList.length == 0) {
  console.log(chalk.redBright("Anime Not Found! 😔"));
} else {
  await showAnimeList(animeName);
  await getEpisodeData(`${process.env.API}/episodes/${animeId[selectedIndex]}`);
  if (animeEpisodeData.total_episodes == 1) {
    console.log(chalk.greenBright(`Playing, ${animeEpisodeData.animeTitle}`));
  } else {
    await askAnimeEpisode();
    if (animeEpisode > animeEpisodeData.total_episodes) {
      animeEpisode = animeEpisodeData.total_episodes;
    }
    console.log(
      chalk.greenBright(
        `Playing, ${animeTitle[selectedIndex]} Episode ${animeEpisode}`
      )
    );
  }

  open(`${process.env.URL}/${animeId[selectedIndex]}/ep${animeEpisode}`);
}
