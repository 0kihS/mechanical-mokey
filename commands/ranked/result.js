const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function expectedProbability(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(ratingA, ratingB, outcome, k = 32) {
  const expectedA = expectedProbability(ratingA, ratingB);
  const expectedB = expectedProbability(ratingB, ratingA);

  const actualA = outcome === 1 ? 1 : 0;
  const actualB = outcome === 0 ? 1 : 0;

  const newRatingA = Math.round(ratingA + k * (actualA - expectedA));
  const newRatingB = Math.round(ratingB + k * (actualB - expectedB));

  return [newRatingA, newRatingB];
}

module.exports = {
data: new SlashCommandBuilder()
  .setName('result')
  .setDescription('enter a result for a ranked duel')
  .addUserOption(option =>
    option.setName('winner')
      .setDescription('Specify which player won the duel')
      .setRequired(true))
  .addUserOption(option =>
    option.setName('loser')
      .setDescription('Specify which player lost the duel')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.EditChannels),
async execute(interaction) {
  const winner = interaction.options.getUser('winner').username;
  const loser = interaction.options.getUser('loser').username;
  try{
    const client = await pool.connect();
    const winnerlb = await client.query('SELECT name, elo FROM players WHERE name = $1', [winner]);
    const loserlb = await client.query('SELECT name, elo FROM players WHERE name = $1', [loser]);
    if (!winnerlb || !loserlb) {
      await interaction.reply('One of the players is not registered on the ranked scoreboard.');
      return;
     }
  winnerelo = winnerlb.elo;
  loserelo = loserlb.elo;
  [winnerelo, loserelo] = updateElo(winnerelo, loserelo, 1);
  await client.query('UPDATE players SET wins = wins + 1, elo = $1 WHERE name = $2', [winnerelo, winner]);
  await client.query('UPDATE players SET elo = $1 WHERE name = $2', [loserelo, loser]);
        await interaction.reply(`Successfully updated the ranked scoreboard.`);
      } catch (error) {
        console.error('Error:', error);
      }
      },
    };