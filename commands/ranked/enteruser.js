const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


module.exports = {
  data: new SlashCommandBuilder()
    .setName('enteruser')
    .setDescription('Adds a user to ranked.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Specify which user to add')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.EditChannels),
  async execute(interaction) {

    const client = await pool.connect();
    const user = interaction.options.getUser('user');
    const name = user.username;
      try {

    // Check if the user with the same name already exists in the ladder
    const result = await client.query('SELECT COUNT(*) FROM players WHERE name = $1;', [name]);

    if (!result.rows[0].count > 0) {

    //Insert new user
    const result = await client.query('INSERT INTO players (name, elo, wins) VALUES ($1, 1000, 0) RETURNING *;', [name]);
    await interaction.reply(`Added <@${result.rows[0].name}> to the ranked leaderboard!.`);

    } else {
      await interaction.reply(`User <@${user.id}> is already registered!.`);
    }
  } catch (error) {
    console.log('Error:', error);
    await interaction.reply('Error:', error);
  }
  finally {
    client.release();
  }

  },
};