const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const Database = require("@replit/database");
const db = new Database()

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
  const winnerid = interaction.options.getUser('winner');
  const loserid = interaction.options.getUser('loser');
  const winner = winnerid.username;
  const loser = loserid.username;
  try{
    const lb = await db.get('lb') || [];
    winnerlb = lb.find(person => person.name === winner);
    loserlb = lb.find(person => person.name === loser);
    if (!winnerlb || !loserlb) {
      await interaction.reply('One of the players is not registered on the ranked scoreboard.');
      return;
     }
  winnerelo = winnerlb.elo;
  loserelo = loserlb.elo;
  [winnerelo, loserelo] = updateElo(winnerelo, loserelo, 1);
    winnerlb.elo = winnerelo;
    winnerlb.wins += 1;
    loserlb.elo = loserelo;
    loserslb.losses += 1;
    await db.set('lb', lb);
        await interaction.reply(`Successfully updated the ranked scoreboard.`);
      } catch (error) {
        console.error('Error:', error);
      }
      },
    };