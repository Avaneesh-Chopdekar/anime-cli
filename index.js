#!/usr/bin/env node

import axios from "axios";
import inquirer from "inquirer";
import open from "open";
import chalk from "chalk";
import * as dotenv from "dotenv";
dotenv.config();
const { URL, API } = process.env
let animeName = "";
let animeEpisode = 1;
let selectedIndex = 0;
let animeEpisodeData = {
    totalEpisodes: 1,
    jpTitle: "",
    episodes: [
        {
            number: 1,
            title: "",
            id: "",
            dubId: "",
            isFiller: false,
        },
    ],
};
let animeList = [];
let animeTitle = [];
let animeId = [];

async function getData(url) {
    animeList = [];
    animeTitle = [];
    animeId = [];
    await axios.get(url).then((response) => {
        animeList = response.data.results;
        animeList.map((anime) => {
            animeTitle.push(anime.title);
            animeId.push(anime.id);
        });
    });
}

async function getEpisodeData(url) {
    await axios.get(url).then((response) => (animeEpisodeData = response.data));
}

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
    if (Number.parseInt(anime.anime_episode) === 0) {
        animeEpisode = 1;
    } else if (
        Number.parseInt(anime.anime_episode) > animeEpisodeData.totalEpisodes
    ) {
        animeEpisode = animeEpisodeData.totalEpisodes;
    } else {
        animeEpisode = anime.anime_episode;
    }
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
await getData(`${API}${animeName}`);
if (animeList.length == 0) {
    console.log(chalk.redBright("Anime Not Found! 😔"));
} else {
    await showAnimeList(animeName);
    await getEpisodeData(`${API}info/${animeId[selectedIndex]}`);
    if (animeEpisodeData.totalEpisodes == 1) {
        console.log(chalk.greenBright(`Playing, ${animeTitle[selectedIndex]}`));
    } else {
        await askAnimeEpisode();
        console.log(
            chalk.greenBright(
                `Playing, ${animeTitle[selectedIndex]} Episode ${animeEpisode}`
            )
        );
    }

    open(`${URL}watch/${animeId[selectedIndex]}/ep-${animeEpisode}`);
}
